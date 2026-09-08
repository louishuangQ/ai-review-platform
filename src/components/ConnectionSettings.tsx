import { useState } from "react";
import { loadConfiguration, saveConfiguration } from "../adapters/operations";
import { Card } from "./Card";
export function ConnectionSettings({ section }: { section: "services" | "wiki" | "schedule" }) {
  const [config, setConfig] = useState(loadConfiguration);
  const [message, setMessage] = useState("");
  const edit = (key: keyof typeof config, value: string | boolean) =>
    setConfig({ ...config, [key]: value });
  function save() {
    try {
      saveConfiguration(config);
      setMessage("配置草稿已保存在当前浏览器。未连接飞书、未修改服务监听端口、未启用后台调度。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请检查浏览器存储权限。");
    }
  }
  return (
    <Card
      title={
        section === "services"
          ? "服务地址与端口"
          : section === "wiki"
            ? "飞书知识库接入"
            : "定期增量审核计划"
      }
    >
      <div className="callout">
        本地配置草稿 · 未部署生效。只保存非密钥配置；请勿填写真实 Token、密码或企业文档正文。
      </div>
      <div className="operations-form">
        {section === "services" && (
          <>
            <p>
              默认值来自本地 Compose；知识库接入服务尚未映射端口。填写 URL 不会改变服务监听端口。
            </p>
            {config.services.map((s, i) => (
              <label key={s.name}>
                {s.name}
                <input
                  placeholder="http://127.0.0.1:端口"
                  value={s.url}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      services: config.services.map((v, j) =>
                        i === j ? { ...v, url: e.target.value } : v,
                      ),
                    })
                  }
                />
                <small>健康检查路径 {s.path} · 尚未探测</small>
              </label>
            ))}
            <p>
              原生预览 4174；Docker 前端 4173；PostgreSQL 5432 / Redis 6379 / S3 9000
              为基础设施端口，不直接向网页暴露连接密码。
            </p>
          </>
        )}
        {section === "wiki" && (
          <>
            <label>
              知识库节点链接
              <input
                placeholder="https://企业域名.feishu.cn/wiki/节点Token"
                value={config.wikiUrl}
                onChange={(e) => edit("wikiUrl", e.target.value)}
              />
            </label>
            <label>
              知识空间 ID
              <input
                value={config.spaceId}
                onChange={(e) => edit("spaceId", e.target.value)}
                placeholder="数字 ID，不能填写节点 Token"
              />
            </label>
            <label>
              App ID
              <input
                value={config.appId}
                onChange={(e) => edit("appId", e.target.value)}
                placeholder="cli_..."
              />
            </label>
            <label>
              后端凭证引用
              <input
                value={config.credentialRef}
                onChange={(e) => edit("credentialRef", e.target.value)}
                placeholder="env:FEISHU_APP_SECRET"
              />
            </label>
            <label>
              归属产品线
              <select value={config.product} onChange={(e) => edit("product", e.target.value)}>
                {["5G", "LTE", "GNSS", "LPWA"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <p>
              接入步骤：配置后端凭证 → 授予知识空间读取权限 → 分页同步节点 → 解析并校验预览 →
              审核。连接状态：未验证；不将空列表当成无新文档。
            </p>
          </>
        )}
        {section === "schedule" && (
          <>
            <label>
              执行频率
              <select value={config.frequency} onChange={(e) => edit("frequency", e.target.value)}>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
              </select>
            </label>
            {config.frequency === "weekly" && (
              <label>
                星期
                <select value={config.weekday} onChange={(e) => edit("weekday", e.target.value)}>
                  {["一", "二", "三", "四", "五", "六", "日"].map((d, i) => (
                    <option key={d} value={i + 1}>
                      星期{d}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              计划启动时间
              <input
                type="time"
                value={config.time}
                onChange={(e) => edit("time", e.target.value)}
              />
            </label>
            <label>
              允许执行窗口开始
              <input
                type="time"
                value={config.windowStart}
                onChange={(e) => edit("windowStart", e.target.value)}
              />
            </label>
            <label>
              允许执行窗口结束
              <input
                type="time"
                value={config.windowEnd}
                onChange={(e) => edit("windowEnd", e.target.value)}
              />
            </label>
            <p>
              时区：{config.timezone}
              ；当前计划：未启用。首次扫描需人工确认范围，成功同步后才推进增量游标。
            </p>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={config.includeUpdated}
                onChange={(e) => edit("includeUpdated", e.target.checked)}
              />
              除新增文档外，已修改版本也重新审核
            </label>
            <div className="callout">
              新增 / 修改版本 → 预览门禁 → AI 初审 → 固定报告 → AI 自校验 →
              人工复核待办。失败保留游标与原因；按空间、文档版本及策略版本去重。人工复核不会定时自动通过。
            </div>
            <a href="#/reports?view=period">查看时间段审核总结果 →</a>
          </>
        )}
        <button className="primary" onClick={save}>
          校验并保存配置草稿
        </button>
        <p role="status">{message}</p>
      </div>
    </Card>
  );
}
