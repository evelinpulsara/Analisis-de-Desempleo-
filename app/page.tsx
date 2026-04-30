import React from 'react';

export default function HomePage() {
  return (
    <>
      {/* Estilos globales - en producción mover a app/globals.css */}
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg-deep:    #020b18;
          --bg-card:    #0d1f35;
          --bg-card2:   #091626;
          --green:      #10b981;
          --green-dim:  rgba(16,185,129,0.18);
          --green-glow: rgba(16,185,129,0.35);
          --border:     rgba(255,255,255,0.07);
          --border-h:   rgba(255,255,255,0.14);
          --text-1:     #f0f6ff;
          --text-2:     rgba(255,255,255,0.55);
          --text-3:     rgba(255,255,255,0.30);
          --font-head:  'Plus Jakarta Sans', sans-serif;
          --font-body:  'Outfit', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font-body);
          background: var(--bg-deep);
          color: var(--text-1);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.4;transform:scale(.75);} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 0 1px rgba(16,185,129,.2);} 50%{box-shadow:0 0 0 1px rgba(16,185,129,.6), 0 0 24px rgba(16,185,129,.15);} }

        .anim-1 { opacity:0; animation: fadeUp .5s ease .10s forwards; }
        .anim-2 { opacity:0; animation: fadeUp .5s ease .20s forwards; }
        .anim-3 { opacity:0; animation: fadeUp .5s ease .30s forwards; }
        .anim-4 { opacity:0; animation: fadeUp .5s ease .40s forwards; }
        .anim-5 { opacity:0; animation: fadeUp .6s ease .55s forwards; }
        .anim-6 { opacity:0; animation: fadeUp .6s ease .70s forwards; }
        .anim-7 { opacity:0; animation: fadeUp .6s ease .85s forwards; }

        nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(2,11,24,.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(16,185,129,.18);
          padding: 18px 48px;
          display: flex; justify-content: space-between; align-items: center;
          animation: fadeIn .5s ease forwards;
        }

        .nav-logo { display:flex; align-items:center; gap:14px; }
        .nav-icon {
          width:42px; height:42px; border-radius:12px;
          background: linear-gradient(135deg, #10b981, #059669);
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 0 18px rgba(16,185,129,.4);
          flex-shrink: 0;
        }
        .nav-icon svg { width:20px; height:20px; stroke:#020b18; fill:none; stroke-width:2; }
        .nav-title {
          font-family: var(--font-head);
          font-size: 18px; font-weight: 700;
          color: var(--text-1); letter-spacing: -.2px;
        }
        .nav-badges { display:flex; gap:10px; align-items:center; }
        .badge {
          padding: 5px 14px; border-radius: 999px;
          font-family: var(--font-body);
          font-size: 12px; font-weight: 600; letter-spacing:.3px;
        }
        .badge-outline { background:transparent; border:1px solid rgba(255,255,255,.15); color:rgba(255,255,255,.55); }
        .badge-green   { background:#10b981; color:#020b18; }
        .live-dot {
          display:inline-block; width:7px; height:7px; border-radius:50%;
          background:#10b981; margin-right:5px;
          animation: pulseDot 1.8s ease-in-out infinite;
        }

        main { max-width: 1280px; margin: 0 auto; padding: 48px 48px 64px; }

        .kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .kpi-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px 22px 20px;
          position: relative; overflow: hidden;
          transition: border-color .3s, transform .2s;
          cursor: default;
        }
        .kpi-card:hover { border-color: var(--border-h); transform: translateY(-3px); }
        .kpi-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, transparent, var(--kpi-accent), transparent);
          opacity:.7;
        }
        .kpi-card:nth-child(1) { --kpi-accent:#f43f5e; }
        .kpi-card:nth-child(2) { --kpi-accent:#3b82f6; }
        .kpi-card:nth-child(3) { --kpi-accent:#f59e0b; }
        .kpi-card:nth-child(4) { --kpi-accent:#10b981; }

        .kpi-icon {
          position:absolute; top:18px; right:18px;
          width:36px; height:36px; border-radius:10px;
          background:rgba(255,255,255,.05);
          display:flex; align-items:center; justify-content:center;
        }
        .kpi-icon svg { width:17px; height:17px; fill:none; stroke-width:2; }
        .kpi-label {
          font-size: 10px; font-weight: 600;
          color: var(--text-3);
          text-transform: uppercase; letter-spacing: 1.2px;
          margin-bottom: 8px;
        }
        .kpi-value {
          font-family: var(--font-head);
          font-size: clamp(22px, 3.5vw, 32px);
          font-weight: 800;
          color: var(--text-1);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 8px;
        }
        .kpi-desc {
          font-size: 11px; color: var(--text-3);
          font-weight: 400;
        }

        .section-row {
          display: grid; grid-template-columns: 2fr 1fr;
          gap: 20px; margin-bottom: 40px;
        }

        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 36px;
          transition: border-color .3s;
        }
        .card:hover { border-color: var(--border-h); }
        .card-title {
          font-family: var(--font-head);
          font-size: 20px; font-weight: 700;
          color: var(--text-1);
          display:flex; align-items:center; gap:10px;
          margin-bottom: 18px;
        }
        .card-title svg { width:20px; height:20px; stroke:#10b981; fill:none; stroke-width:2; flex-shrink:0; }
        .card-body {
          font-size: 15px; line-height: 1.8;
          color: var(--text-2);
        }
        .card-body strong { color: rgba(255,255,255,.85); font-weight:600; }

        .card-meth {
          background: linear-gradient(145deg, #0a3d2e 0%, #062a1f 100%);
          border-radius: 24px; padding: 32px;
          animation: borderGlow 3s ease-in-out infinite;
        }
        .meth-title {
          font-family: var(--font-head);
          font-size: 16px; font-weight: 700;
          color: #10b981;
          display:flex; align-items:center; gap:8px;
          margin-bottom: 24px;
        }
        .meth-title svg { width:18px; height:18px; stroke:#10b981; fill:none; stroke-width:2; }
        .meth-list { list-style:none; display:flex; flex-direction:column; gap:0; }
        .meth-list li {
          font-size: 13.5px;
          color: rgba(200,230,215,.75);
          display:flex; align-items:center; gap:10px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(16,185,129,.1);
        }
        .meth-list li:last-child { border-bottom:none; padding-bottom:0; }
        .check {
          width:20px; height:20px; border-radius:6px; flex-shrink:0;
          background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.4);
          display:flex; align-items:center; justify-content:center;
        }
        .check svg { width:11px; height:11px; stroke:#10b981; fill:none; stroke-width:3; }

        .viz-header {
          display:flex; align-items:center; gap:16px;
          margin-bottom: 24px;
        }
        .viz-title {
          font-family: var(--font-head);
          font-size: 20px; font-weight: 700; color: var(--text-1);
          white-space: nowrap;
        }
        .viz-line { flex:1; height:1px; background:linear-gradient(90deg, rgba(255,255,255,.1), transparent); }
        .viz-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:40px; }
        .viz-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 20px;
          height: 660px; display:flex; flex-direction:column;
          transition: border-color .3s, box-shadow .3s;
        }
        .viz-card:hover { border-color: var(--border-h); box-shadow: 0 20px 50px rgba(0,0,0,.4); }
        .viz-card-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom: 14px; padding: 0 4px;
        }
        .viz-label {
          display:flex; align-items:center; gap:7px;
          font-size: 10px; font-weight:700;
          color: rgba(255,255,255,.45);
          text-transform: uppercase; letter-spacing:1.8px;
        }
        .viz-label svg { width:15px; height:15px; fill:none; stroke-width:2; flex-shrink:0; }
        .tag-pill {
          font-size:10px; padding:4px 10px; border-radius:999px;
          background:rgba(255,255,255,.05); color:rgba(255,255,255,.3);
          border:1px solid rgba(255,255,255,.07);
        }
        .viz-frame {
          flex:1; border-radius:14px; overflow:hidden;
          background: var(--bg-card2);
          border: 1px solid rgba(255,255,255,.05);
        }
        .viz-frame iframe { width:100%; height:100%; border:none; display:block; }

        .team-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 40px;
          margin-bottom: 40px; text-align:center;
        }
        .team-heading {
          font-family: var(--font-head);
          font-size: 20px; font-weight:700; color:var(--text-1);
          margin-bottom: 36px;
        }
        .team-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .team-member {
          display:flex; flex-direction:column; align-items:center; gap:10px;
          padding: 24px 16px; border-radius:18px;
          border: 1px solid rgba(255,255,255,.05);
          transition: border-color .3s, background .3s, transform .2s;
          cursor:default;
        }
        .team-member:hover { border-color:rgba(16,185,129,.3); background:rgba(16,185,129,.04); transform:translateY(-4px); }
        .avatar {
          width:56px; height:56px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-family: var(--font-head); font-size:18px; font-weight:700;
          border:2px solid; transition: box-shadow .3s;
        }
        .team-member:hover .avatar { box-shadow: 0 0 22px currentColor; }
        .av-i { background:rgba(99,102,241,.14); color:#818cf8; border-color:rgba(99,102,241,.3); }
        .av-e { background:rgba(16,185,129,.14); color:#34d399; border-color:rgba(16,185,129,.3); }
        .av-b { background:rgba(59,130,246,.14); color:#60a5fa; border-color:rgba(59,130,246,.3); }
        .av-s { background:rgba(100,116,139,.14); color:#94a3b8; border-color:rgba(100,116,139,.3); }
        .member-name { font-family:var(--font-head); font-size:15px; font-weight:700; color:var(--text-1); }
        .member-role { font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:.8px; }

        footer {
          background: var(--bg-deep);
          border-top: 1px solid rgba(255,255,255,.06);
          padding: 26px 48px;
          display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;
        }
        .footer-brand {
          display:flex; align-items:center; gap:8px;
          font-family:var(--font-head); font-size:14px; font-weight:700; color:var(--text-1);
        }
        .footer-brand svg { width:16px; height:16px; stroke:#10b981; fill:none; stroke-width:2; }
        .footer-copy { font-size:12px; color:var(--text-3); }
        .footer-stack { display:flex; gap:8px; }
        .stack-tag {
          font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
          color:#10b981; padding:4px 10px;
          border:1px solid rgba(16,185,129,.25); border-radius:6px;
          background:rgba(16,185,129,.06);
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo">
          <div className="nav-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <span className="nav-title">Sistema de Inteligencia Laboral</span>
        </div>
        <div className="nav-badges">
          <span className="badge badge-outline"><span className="live-dot"></span>Proyecto Hackatón 2026</span>
          <span className="badge badge-green">Colombia</span>
        </div>
      </nav>

      <main>
        {/* KPIs */}
        <div className="kpis">
          <div className="kpi-card anim-1">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" stroke="#f43f5e"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div className="kpi-label">Tasa Deserción</div>
            <div className="kpi-value">3.6%</div>
            <div className="kpi-desc">Promedio Nacional</div>
          </div>
          <div className="kpi-card anim-2">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" stroke="#3b82f6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="kpi-label">Total Matriculados</div>
            <div className="kpi-value">14 Mill.</div>
            <div className="kpi-desc">Base de datos SNIES</div>
          </div>
          <div className="kpi-card anim-3">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" stroke="#f59e0b"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="kpi-label">Total Desertores</div>
            <div className="kpi-value">526 Mil</div>
            <div className="kpi-desc">Población en riesgo</div>
          </div>
          <div className="kpi-card anim-4">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" stroke="#10b981"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
            <div className="kpi-label">Mayor Riesgo</div>
            <div className="kpi-value">Amazonas</div>
            <div className="kpi-desc">Región prioridad alta</div>
          </div>
        </div>

        {/* OBJETIVO + METODOLOGIA */}
        <div className="section-row anim-5">
          <div className="card">
            <div className="card-title">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Objetivo del Análisis
            </div>
            <p className="card-body">
              Esta plataforma integra datos del <strong>DANE</strong> y <strong>SNIES</strong> para visualizar las brechas
              laborales y educativas en Colombia. El propósito es transformar datos crudos en decisiones
              estratégicas, permitiendo a las instituciones identificar dónde se requiere mayor intervención académica.
            </p>
          </div>
          <div className="card-meth">
            <div className="meth-title">
              <svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              Metodología
            </div>
            <ul className="meth-list">
              <li><span className="check"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>Extracción de Microdatos oficiales</li>
              <li><span className="check"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>Limpieza y Modelado en Power BI</li>
              <li><span className="check"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>Despliegue Web con Next.js 14</li>
              <li><span className="check"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>Arquitectura de Responsabilidad Única</li>
            </ul>
          </div>
        </div>

        {/* DASHBOARDS */}
        <div className="anim-6">
          <div className="viz-header">
            <span className="viz-title">Visualización de Datos</span>
            <div className="viz-line"></div>
          </div>
          <div className="viz-grid">
            <div className="viz-card">
              <div className="viz-card-header">
                <div className="viz-label">
                  <svg viewBox="0 0 24 24" stroke="#10b981"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  Análisis Territorial
                </div>
                <span className="tag-pill">Interactivo</span>
              </div>
              <div className="viz-frame">
                <iframe
                  title="hackaton final"
                  src="https://app.powerbi.com/view?r=eyJrIjoiYzJjNmFhMjgtYzUxZC00YjExLWI5NGYtYTg1NjM3YjdiMmNiIiwidCI6IjhkMzY4MzZlLTZiNzUtNGRlNi1iYWI5LTVmNGIxNzc1NDI3ZiIsImMiOjR9"
                  frameBorder="0" allowFullScreen={true}
                />
              </div>
            </div>
            <div className="viz-card">
              <div className="viz-card-header">
                <div className="viz-label">
                  <svg viewBox="0 0 24 24" stroke="#3b82f6"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Dinámica del Sector
                </div>
                <span className="tag-pill">Actualizado</span>
              </div>
              <div className="viz-frame">
                <iframe
                  title="hackaton final3"
                  src="https://app.powerbi.com/view?r=eyJrIjoiOTQ5M2RjMzctZDcwNy00YTRiLTg1ZGUtYWYzMmViNTkwYjE0IiwidCI6IjhkMzY4MzZlLTZiNzUtNGRlNi1iYWI5LTVmNGIxNzc1NDI3ZiIsImMiOjR9"
                  frameBorder="0" allowFullScreen={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* EQUIPO */}
        <div className="team-card anim-7">
          <div className="team-heading">Equipo del Proyecto</div>
          <div className="team-grid">
            <div className="team-member">
              <div className="avatar av-i">M</div>
              <span className="member-name">Mateo</span>
              <span className="member-role">Líder de Proyecto</span>
            </div>
            <div className="team-member">
              <div className="avatar av-e">E</div>
              <span className="member-name">Evelin</span>
              <span className="member-role">Software Engineer</span>
            </div>
            <div className="team-member">
              <div className="avatar av-b">E</div>
              <span className="member-name">Esteban</span>
              <span className="member-role">Data Analyst</span>
            </div>
            <div className="team-member">
              <div className="avatar av-s">K</div>
              <span className="member-name">Kevin</span>
              <span className="member-role">Data Analyst</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Inteligencia Laboral
        </div>
        <p className="footer-copy">&copy; 2026 Universidad Cooperativa de Colombia – Pasto</p>
        <div className="footer-stack">
          <span className="stack-tag">Next.js</span>
          <span className="stack-tag">Tailwind</span>
          <span className="stack-tag">Power BI</span>
        </div>
      </footer>
    </>
  );
}