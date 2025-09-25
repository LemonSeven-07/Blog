import { memo } from 'react';
import avatar from '@/assets/images/avatar.png';
import { config } from '@/config';

const AuthorCard = () => {
  return (
    <div className="author-info">
      <div className="author-avatar">
        <img src={avatar} alt="作者头像" />
      </div>
      <div className="author-name">yolo</div>
      <div className="personal-signature">生活本身就是一种无法逃避的孤独。</div>
      <div className="social-links">
        <a
          className="iconfont icon-github"
          href={config.GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        />

        <a
          className="iconfont icon-gitee"
          href={config.GITEE_URL}
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </div>
  );
};

export default memo(AuthorCard);
