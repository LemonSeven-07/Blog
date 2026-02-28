const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { randomUUID } = require('crypto');
// 导入发送邮件的包文件
const nodemailer = require('nodemailer');

const { redisClient } = require('../db/redis.js');

class BlogPackagingMethod {
  /**
   * @description: 生成 accessToken 和 refreshToken
   * @param {*} userInfo 登录用户关键信息 包含：用户id、用户名、邮箱、用户头像、用户权限、禁言
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
   * @description: 合并相同key的posts和comments
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

  async sendEmailConfig(email, code, type) {
    const { USER_EMAIL, USER_EMAIL_PASS, EMAIL_CODE_EXPIRE } = process.env;
    try {
      // 建立一个 SMTP 连接
      let transporter = await nodemailer.createTransport({
        host: 'smtp.qq.com',
        secure: false, // true for 465, false for other ports
        port: 25,
        auth: {
          // user 为发送方的邮箱地址， pass 为发送方的邮箱密码生成的授权码
          user: USER_EMAIL,
          pass: USER_EMAIL_PASS,
        },
      });
      // 配置相关参数
      let option = {
        // from 为发送方的邮箱地址， to 为接收方的邮件地址
        from: USER_EMAIL,
        to: email,
      };

      if (type === 'register') {
        option.subject = "[yolo's blog] 注册邮箱验证码";
        option.html = `<div style="font-family: Arial, sans-serif; line-height: 1.8;">
            <h2 style="color: #409EFF;">欢迎注册 yolo's blog 🎉</h2>
            <p>您好！感谢您注册 yolo's blog。</p>
            <p>您的注册验证码是：
              <span style="color: #409EFF; font-size: 18px; font-weight: bold;">${code}</span>
            </p>
            <p>该验证码 <strong>${EMAIL_CODE_EXPIRE} 分钟</strong> 内有效，请尽快完成验证。</p>
            <p>如果这不是您本人的操作，请忽略此邮件。</p>
          </div>`;
      } else if (type === 'reset') {
        option.subject = "[yolo's blog] 重置密码邮箱验证码";
        option.html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.8;">
            <h2 style="color: #409EFF;">重置密码请求</h2>
            <p>您好！我们收到了您在 yolo's blog 上的密码重置请求。</p>
            <p>您的验证码是：
              <span style="color: #E74C3C; font-size: 18px; font-weight: bold;">${code}</span>
            </p>
            <p>该验证码 <strong>${EMAIL_CODE_EXPIRE} 分钟</strong> 内有效。</p>
            <p>如果这不是您本人发起的操作，请忽略此邮件，您的账号仍然安全。</p>
          </div>
        `;
      } else {
        option.subject = "[yolo's blog] 邮箱验证码";
        option.html = `
          <div>
            <p>验证码：
              <span style="color: #409EFF;">${code}</span>
            </p>
            <p>该验证码 <strong>${EMAIL_CODE_EXPIRE} 分钟</strong> 内有效。</p>
            <p>如果这不是您本人的操作，请忽略此邮件。</p>
          </div>
        `;
      }

      return { transporter, option };
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @description: 清除上传的临时文件
   * @param {*} filepaths 需要清除的临时文件路径数组
   * @param {*} delay 延时清除时间  默认 5s
   * @return {*}
   */
  clearCacheFiles(filepaths, delay = 5000) {
    setTimeout(() => {
      filepaths.forEach(filepath => {
        // 删除导入临时文件
        fs.rm(
          filepath,
          {
            recursive: true, // 递归删除
            force: true, // 忽略不存在的路径
            maxRetries: 3, // 重试次数(针对文件锁定)
            retryDelay: 100, // 重试间隔(ms)
          },
          err => {
            if (err) console.error('❌ 临时文件清除失败:', err);
          },
        );
      });
    }, delay);
  }

  /**
   * @description: 上传图片到 GitHub
   * @param {Buffer} buffer 文件二进制
   * @param {string} mimetype 文件类型，例如 image/png
   * @return {string} 图片的 jsDelivr CDN 地址
   */
  async uploadImageToGitHub(buffer, mimetype, dir = 'cover') {
    const {
      GITHUB_OWNER,
      GITHUB_TOKEN,
      GITHUB_REPO,
      GITHUB_USER_DIR,
      GITHUB_MD_DIR,
      GITHUB_COVER_DIR,
    } = process.env;
    const dirMap = {
      cover: GITHUB_COVER_DIR,
      md: GITHUB_MD_DIR,
      user: GITHUB_USER_DIR,
    };
    const ext = mimetype.split('/')[1] || 'png';
    const fileName = `${randomUUID()}.${ext}`;

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dirMap[dir]}/${fileName}`;

    const base64Content = buffer.toString('base64');

    const response = await axios.put(
      apiUrl,
      {
        message: `upload image ${fileName}`,
        content: base64Content,
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    // jsDelivr CDN 地址
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@master/${dirMap[dir]}/${fileName}`;

    return {
      fileName,
      cdnUrl,
      githubUrl: response.data.content.html_url,
    };
  }

  /**
   * @description: 删除 GitHub 上的图片
   * @param {*} url 图片CDN URL
   * @return {*}
   */
  deleteGitHubImage(url) {
    if (!url) return Promise.resolve();
    // 正则提取 @branch 后面的路径，不包含开头的 /
    const regex = /https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+@[^\/]+\/(.+)/;
    const match = url.match(regex);
    if (match) {
      const filePath = match[1];
      const { GITHUB_OWNER, GITHUB_TOKEN, GITHUB_REPO } = process.env;
      const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

      return axios
        .get(apiUrl, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
          },
        })
        .then(response => {
          const sha = response.data.sha;

          return axios.delete(apiUrl, {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github+json',
            },
            data: {
              message: `delete image ${filePath}`,
              sha: sha,
            },
          });
        });
    } else {
      return Promise.reject(new Error('Invalid GitHub CDN URL'));
    }
  }

  /**
   * @description: 将 YYYYMMDD 格式的日期字符串转换为日期时间字符串
   * @param {*} yyyymmdd 日期字符串，格式为 YYYYMMDD，例如 20240601
   * @param {*} endOfDay 是否转换为当天的结束时间（23:59:59），默认为 false（转换为当天的开始时间 00:00:00）
   * @return {*}
   */
  yyyymmddToDateTime(yyyymmdd, endOfDay = false) {
    const str = String(yyyymmdd);

    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);

    return endOfDay ? `${year}-${month}-${day} 23:59:59` : `${year}-${month}-${day} 00:00:00`;
  }
}

module.exports = new BlogPackagingMethod();
