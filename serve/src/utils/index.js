const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）

class blogPackagingMethod {
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
   * ✅ 一级评论 deletedAt != null：提取它的未删除子评论作为一级评论。
      ▪️ 删除 entityId 和 replyToUser
      ▪️ 如果该子评论也被其他评论回复（即 entityId 等于这个评论 id），将这些作为 replies
     ✅ 一级评论 deletedAt == null：保留，但其 replies 需要：
      ▪️ 只保留 deletedAt == null 的
      ▪️ 若 entityId 指向已删除评论，清空其 replyToUser
   * @param {String} comments
   * @return {Object}
   */
  restructureComments(comments) {
    const result = [];
    const tempReplies = new Map();

    for (const comment of comments) {
      if (comment.deletedAt === null) {
        const replies = (comment.replies || [])
          .filter(r => r.deletedAt === null)
          .map(r => {
            const reply = { ...r };
            if (reply.entityId !== comment.id) {
              reply.replyToUser = {};
            }
            delete reply.entityId;
            return reply;
          });

        result.push({
          ...comment,
          replies,
        });
      } else {
        for (const reply of comment.replies || []) {
          if (reply.deletedAt === null) {
            const newReply = { ...reply };
            delete newReply.entityId;
            delete newReply.replyToUser;
            tempReplies.set(reply.id, {
              ...newReply,
              replies: [],
            });
          }
        }
      }
    }

    // 处理 reply 的子 reply
    for (const reply of comments.flatMap(c => c.replies || [])) {
      if (reply.deletedAt === null && reply.entityId && tempReplies.has(reply.entityId)) {
        const parent = tempReplies.get(reply.entityId);
        parent.replies.push({
          ...reply,
          replyToUser: reply.replyToUser || {},
        });
      }
    }

    // 去除子 reply 被提级重复
    const childReplyIds = new Set();
    for (const item of tempReplies.values()) {
      for (const r of item.replies) {
        childReplyIds.add(r.id);
      }
    }

    for (const [id, reply] of tempReplies.entries()) {
      if (!childReplyIds.has(id)) {
        result.push(reply);
      }
    }

    return result;
  }
}

module.exports = new blogPackagingMethod();
