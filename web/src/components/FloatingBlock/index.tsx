import { memo, useState, useRef } from 'react';
import {
  SunOutlined,
  MoonOutlined,
  ArrowUpOutlined,
  SettingOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Button } from 'antd';
import { motion, AnimatePresence } from 'motion/react';

import { useTheme } from '@/hooks/useTheme';
import './index.scss';

const FloatingBlock = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 拖拽状态
  const constraintsRef = useRef(null); // 拖拽约束参考

  const { isDark, toggleThemeByEvent } = useTheme();

  const toggleExpanded = () => {
    // 如果正在拖拽，不触发展开/收起
    if (isDragging) return;
    setIsExpanded(!isExpanded);
  };

  // 处理拖拽开始
  const handleDragStart = () => {
    setIsDragging(true);
    // 如果展开状态，先收起
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    // 延迟重置拖拽状态，避免立即触发点击事件
    setTimeout(() => setIsDragging(false), 100);
  };

  // 返回顶部功能
  const returnTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actionItems = [
    {
      icon: isDark ? SunOutlined : MoonOutlined,
      id: 'theme',
      label: isDark ? '切换到亮色模式' : '切换到暗色模式',
      onClick: toggleThemeByEvent
    },
    {
      icon: ArrowUpOutlined,
      id: 'top',
      label: '返回顶部',
      onClick: returnTop
    }
  ];

  // 计算每个项目的位置（圆形分布）
  const getItemPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // 从顶部开始
    const radius = 55; // 半径 [距离按钮的距离]
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <div ref={constraintsRef} className="floating-box">
      <motion.div
        className="floating-buttons"
        initial={{ bottom: 180, right: 60 }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05, zIndex: 1000 }}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* 围绕的功能项 */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {actionItems.map((item, index) => {
                const position = getItemPosition(index, actionItems.length);
                return (
                  <motion.div
                    key={item.id}
                    initial={{
                      // 初始状态
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      // 动画状态
                      opacity: 1,
                      scale: 1,
                      x: position.x,
                      y: position.y
                    }}
                    exit={{
                      // 退出状态
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    transition={{
                      // 过渡动画
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ position: 'relative' }}
                    >
                      <Button
                        shape="circle"
                        size="middle"
                        className="floating-button-item"
                        onClick={item.onClick}
                        title={item.label}
                        aria-label={item.label}
                        icon={<item.icon />}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* 主按钮 */}
        <motion.div
          whileHover={{ scale: isDragging ? 1 : 1.1 }}
          whileTap={{ scale: isDragging ? 1 : 0.95 }}
          transition={{ duration: 0.2 }}
          style={{ position: 'relative' }}
        >
          <Button
            shape="circle"
            size="large"
            className="floating-main-button"
            onClick={toggleExpanded}
            aria-label={isExpanded ? '收起功能菜单' : '展开功能菜单'}
            title={isExpanded ? '收起功能菜单' : '展开功能菜单'}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              {isExpanded ? (
                <AppstoreOutlined style={{ fontSize: '1.75rem' }} />
              ) : (
                <SettingOutlined style={{ fontSize: '1.75rem' }} />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default memo(FloatingBlock);
