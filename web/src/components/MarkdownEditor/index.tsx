import { useState, useRef, useEffect } from 'react';
import { MdEditor, config, type ToolbarNames } from 'md-editor-rt';
import { ExportPDF } from '@vavt/rt-extension';
import { Mark } from '@vavt/rt-extension';
import { OriginalImg } from '@vavt/rt-extension';
import { Emoji } from '@vavt/rt-extension';
import MarkExtension from 'markdown-it-mark';
import 'md-editor-rt/lib/style.css';
import '@vavt/rt-extension/lib/asset/ExportPDF.css';
import '@vavt/rt-extension/lib/asset/Mark.css';
import '@vavt/rt-extension/lib/asset/Emoji.css';
import '@vavt/rt-extension/lib/asset/OriginalImg.css';
import { message } from 'antd';
import api from '@/api';
import { useAppDispatch } from '@/store/hooks';
import { setDraftContent } from '@/store/modules/draft';

config({
  markdownItConfig(md) {
    md.use(MarkExtension);
  }
});

const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  0,
  1,
  2,
  3,
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'prettier',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog',
  'github'
];

interface MarkdownEditorProps {
  initialValue: string;
  height?: string;
  onChange?: (value: string) => void; // 当markdown编辑器为表单项时，提供一个onChange回调函数来更新表单的值，使其成为受控组件
}

const MarkdownEditor = ({ initialValue = '', height = '100%', onChange }: MarkdownEditorProps) => {
  // 用来存储Markdown文本
  const [text, setText] = useState(initialValue);
  const pdfRef = useRef(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (initialValue !== text) setText(initialValue);
  }, [initialValue]);

  /**
   * @description: 保存临时草稿
   * @param {string} value
   * @return {*}
   */
  const onSave = (value: string) => {
    if (value.trim().length) {
      dispatch(setDraftContent({ content: value.trim() }));
      message.success('文章已保存为草稿，您可以随时继续编辑。');
    } else {
      message.error('内容不能为空，无法保存草稿');
    }
  };

  /**
   * @description: 上传图片
   * @param {File} value
   * @return {*}
   */
  const onUploadImg = async (files: File[], callback: (values: string[]) => void) => {
    // 检查是否有文件上传
    if (files.length === 0) {
      console.error('没有文件可以上传');
      return;
    }
    const formData = new FormData();
    // 将文件添加到 FormData 中
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      // 调用上传 API
      const res = await api.articleApi.uploadImage(formData);

      // 检查响应是否成功
      if (res.data && res.data.imageUrls) {
        // 回调函数返回上传成功的图片 URLs
        callback(res.data.imageUrls);
      } else {
        console.error('上传失败：没有返回图片URL');
      }
    } catch (error) {
      // 处理上传过程中的错误
      console.error('上传失败:', error);
    }
  };

  /**
   * @description: 修改文章内容时触发
   * @param {string} value
   * @return {*}
   */
  const updateContent = (value: string) => {
    if (onChange) {
      onChange(value);
    }
    setText(value);
  };

  return (
    <>
      <MdEditor
        value={text}
        onChange={(v) => updateContent(v)}
        toolbars={toolbars}
        defToolbars={[
          <Mark key="mark" />,
          <Emoji key="emoji" />,
          <OriginalImg key="originalImg" />,
          <ExportPDF
            key="exportPDF"
            ref={pdfRef}
            value={text}
            // onStart={() => {
            //   console.log('onStart');
            // }}
          />
        ]}
        onSave={onSave}
        onUploadImg={onUploadImg}
        style={{ width: '100%', height }}
      />
    </>
  );
};

export default MarkdownEditor;
