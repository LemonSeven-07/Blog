const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const { redisClient } = require('../db/redis.js');

class blogPackagingMethod {
  /**
   * @description: 生成 accessToken 和 refreshToken
   * @param {*} userInfo 登录用户关键信息 包含：用户id、用户名、用户权限、禁言
   * @return {*} { accessToken, refreshToken }
   */
  issueTokens(userInfo) {
    const { ACCESS_EXPIRE, REFRESH_EXPIRE, JWT_SECRET, REDIS_TOKEN_CACHE_TTL } = process.env;
    const jti = randomUUID();
    let seesionId = randomUUID();
    if (userInfo.seesionId) seesionId = userInfo.seesionId;

    // 生成 AccessToken（短时）
    const accessToken = jwt.sign({ ...userInfo, jti, seesionId }, JWT_SECRET, {
      expiresIn: ACCESS_EXPIRE,
    });

    // 生成 RefreshToken（长时 + jti）
    const refreshToken = jwt.sign({ ...userInfo, jti, seesionId }, JWT_SECRET, {
      expiresIn: REFRESH_EXPIRE,
    });

    // 存到 Redis（key: refresh:jti）
    redisClient.set(
      `refresh_token:user:${userInfo.userId}`,
      jti,
      'EX',
      60 * 60 * 24 * REDIS_TOKEN_CACHE_TTL,
    );

    return { accessToken, refreshToken };
  }
  /**
   * 解析上传的文件的前缀
   * @param {String} fileData
   * @return {Object} - date category tags content
   */
  decodeFile(fileData) {
    const sliceData = fileData.slice(0, 500).trim(); // slice(0, 500) 我们需要对文章里包含的前缀进行解析 前缀参考 hexo 创建的前缀内容
    const lastIndex = sliceData.lastIndexOf('\n---');
    const hasPrefix = sliceData.indexOf('---') === 0 && lastIndex > 0;
    if (hasPrefix) {
      const result = {};
      const prefixData = sliceData.slice(4, lastIndex);
      // md 文件包含前缀
      const _decodePrefix = prefixStr => {
        const keyList = prefixStr.match(/.*[a-z]:/g); // 获取到 key 值
        const _loop = (prev, next) => {
          const start = prefixData.indexOf(prev) + prev.length;
          const end = prefixData.indexOf(next);
          const trimStr =
            end === -1 ? prefixData.slice(start).trim() : prefixData.slice(start, end).trim(); // 字符串截取 + trim
          const valueArr = trimStr.split('\n').reduce((list, item) => {
            const _item = item.trim();
            if (_item.indexOf('- ') === 0) {
              // 以 - 开头则消除
              list.push(_item.replace(/- /, ''));
            } else {
              list.push(_item);
            }
            return list;
          }, []);

          const key = prev.replace(/:/, '');

          // 转化 value
          if (['title', 'date'].includes(key)) {
            if (key === 'title') {
              valueArr[0] = valueArr[0].replace(/^(\s|[,'"])+|(\s|[,'"])+$/g, ''); // 可能出现 title： ‘xxx’ 的情况 需要除去 ‘’
            }
            result[key] = valueArr[0];
          } else if (['tags', 'category'].includes(key)) {
            result[key] = valueArr;
          }

          return result;
        };

        keyList.forEach((k, i) => _loop(k, keyList[i + 1])); // 解析 prefix
      };

      _decodePrefix(prefixData);

      result.content = fileData.slice(lastIndex + 4).trim();
      return result;
    } else {
      return { content: fileData };
    }
  }

  /**
   * @description:
   * deletedAt 有值 → 修改 content = '该评论已删除'。
   * 孤立一级评论：删除态且没有二级评论，或全部二级评论都是删除态 → 移除该一级评论。
   * 孤立二级评论：删除态且没有其他评论的 entityId 指向它 → 移除。
   * @param {*} comments
   * @return {*}
   */
  transformComments(comments) {
    const DELETED_TOP = '该评论已删除';
    const DELETED_REPLY = '该回复已删除';

    const result = [];

    for (const original of comments) {
      // —— 复制一级评论，避免原地修改
      const top = { ...original };
      if (top.deletedAt) top.content = DELETED_TOP;

      // —— 复制 replies，并把删除态回复的 content 改成“该回复已删除”
      const replies = (top.replies || []).map(r => ({
        ...r,
        content: r.deletedAt ? DELETED_REPLY : r.content,
      }));

      // —— 建立索引：id -> 节点；以及 parentId(entityId) -> children 列表
      const byId = new Map(replies.map(r => [r.id, r]));
      const children = new Map();
      // 顶层评论也作为一个“父节点键”，用于承接直接回复顶层的评论
      children.set(top.id, []);

      for (const r of replies) {
        if (!children.has(r.entityId)) children.set(r.entityId, []);
        children.get(r.entityId).push(r.id);
        // 确保每个回复节点也有 children 桶（即使为空）
        if (!children.has(r.id)) children.set(r.id, []);
      }

      // —— 递归剔除“删除态且无子”的回复（自底向上反复修剪，直到不再变化）
      const alive = new Set(replies.map(r => r.id));
      let changed = true;
      while (changed) {
        changed = false;
        // 注意：遍历时用当前 alive 的快照，避免边遍历边修改导致跳过
        for (const id of Array.from(alive)) {
          const node = byId.get(id);
          if (!node || !node.deletedAt) continue; // 只考虑删除态
          const kids = (children.get(id) || []).filter(cid => alive.has(cid));
          if (kids.length === 0) {
            alive.delete(id); // 删除这个“删除叶子”
            changed = true;
          }
        }
      }

      // —— 过滤出最终保留的 replies（保持原有顺序）
      top.replies = replies.filter(r => alive.has(r.id));

      // —— 顶层评论是否保留：未删除 或（删除但仍有回复）
      const keepTop = !top.deletedAt || top.replies.length > 0;
      if (keepTop) result.push(top);
    }

    return result;
  }

  /**
   * 合并相同key的posts和comments
   * @param {Array} data - 原始数据
   * @returns {Object} 结构: { [key]: Array<post|comment> }
   */
  optimizeGroupAndFilter(data) {
    const result = Object.create(null);

    // 单次遍历处理
    data.forEach(item => {
      // 确定分组key
      let key;
      if (item.entityType === 'post' && item.authorId !== item.userId) {
        key = item.authorId;
      } else if (item.entityType === 'comment' && item.replyToUserId !== item.userId) {
        key = item.replyToUserId;
      } else {
        return; // 跳过不符合条件的数据
      }

      // 初始化或追加到对应分组
      result[key] = result[key] || [];
      result[key].push(item);
    });

    return result;
  }
}

module.exports = new blogPackagingMethod();
