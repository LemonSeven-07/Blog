import React, { memo, type ReactNode } from 'react';
import { Drawer } from 'antd';

interface DrawerProps {
  placement: 'top' | 'right' | 'bottom' | 'left';
  open: boolean;
  handleClose: () => void;
  children?: ReactNode;
  width?: number;
}

const SidebarDrawer: React.FC<DrawerProps> = ({
  placement,
  open,
  handleClose,
  children,
  width
}) => {
  const style: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    width: (width || 18) + 'rem',
    height: '100vh'
  };
  if (placement === 'right') style.right = 0;
  if (placement === 'left') style.left = 0;

  return (
    <>
      <Drawer
        placement={placement}
        width={(width || 18) + 'rem'}
        closable={false}
        onClose={() => handleClose()}
        open={open}
        maskClosable={true}
        styles={{
          body: {
            padding: 0,
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          },
          mask: {
            backgroundColor: 'rgba(0,0,0,0.45)'
          }
        }}
        style={style}
        getContainer={() => document.body}
        afterOpenChange={(open) => {
          if (open) document.body.style.overflow = 'auto';
          else document.body.style.overflow = '';
        }}
        className="sidebar-drawer-collapsed"
      >
        {children}
      </Drawer>
    </>
  );
};

export default memo(SidebarDrawer);
