const fs = require('fs'); // 原生路径处理模块（用于安全拼接路径）

class fileProcess {
  /**
   * 解析上传的文件的前缀
   * @param {String} fileData
   * @return {Object} - title date categories tags content
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
}

module.exports = new fileProcess();
