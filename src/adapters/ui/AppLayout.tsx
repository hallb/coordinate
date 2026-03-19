import React from "react";
import { Layout, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FileTextOutlined,
  InsuranceOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { HouseholdSwitcher } from "./HouseholdSwitcher";
import { OfflineIndicator } from "./OfflineIndicator";

const { Header, Content, Sider } = Layout;

const navItems = [
  {
    key: "/claims",
    path: "/claims",
    label: "Claims",
    icon: <FileTextOutlined />,
  },
  {
    key: "/plans",
    path: "/plans",
    label: "Plans",
    icon: <InsuranceOutlined />,
  },
  {
    key: "/settings",
    path: "/settings",
    label: "Settings",
    icon: <SettingOutlined />,
  },
];

export function AppLayout(): React.ReactElement {
  const location = useLocation();
  const selectedKey =
    navItems.find((i) => location.pathname.startsWith(i.path))?.key ??
    "/claims";

  const menuItems = navItems.map(({ key, path, label, icon }) => ({
    key,
    icon,
    label: <Link to={path}>{label}</Link>,
  }));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <OfflineIndicator />
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          paddingInline: "1rem",
          background: "var(--ant-color-bg-container)",
          borderBottom: "1px solid var(--ant-color-border)",
        }}
      >
        <HouseholdSwitcher />
      </Header>
      <Layout>
        {/* Desktop: sidebar (hidden below 1024px via breakpoint) */}
        <Sider
          breakpoint="lg"
          collapsedWidth={0}
          width={200}
          style={{ background: "var(--ant-color-bg-container)" }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Layout>
          <Content
            style={{ padding: "1rem", minHeight: "calc(100vh - 64px - 56px)" }}
          >
            <Outlet />
          </Content>
          {/* Mobile: bottom tab bar (visible only below lg) */}
          <div
            className="mobile-bottom-nav"
            style={{
              display: "none",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: 56,
              background: "var(--ant-color-bg-container)",
              borderTop: "1px solid var(--ant-color-border)",
              zIndex: 100,
            }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={menuItems}
              style={{
                justifyContent: "center",
                borderBottom: "none",
                lineHeight: "56px",
              }}
            />
          </div>
        </Layout>
      </Layout>
      {/* CSS for mobile: show bottom nav when viewport < 1024px */}
      <style>{`
        @media (max-width: 1023px) {
          .mobile-bottom-nav { display: block !important; }
          .ant-layout-content { padding-bottom: 72px !important; }
        }
        @media (min-width: 1024px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}
