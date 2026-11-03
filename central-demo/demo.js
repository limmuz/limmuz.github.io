/* Demo estática: as chamadas à API viram arquivos JSON gravados (dados fictícios). Nada é gravado. */
(function () {
  const chave = (u) => {
    const [p, q] = u.replace(/^\/?/, "").split("?");
    return (p + (q ? "@" + q : "")).replace(/[^A-Za-z0-9._@-]/g, "_");
  };
  const json = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json" } });
  const original = window.fetch.bind(window);
  window.fetch = async function (input, opts) {
    const url = typeof input === "string" ? input : input.url;
    const rel = url.replace(location.origin + location.pathname.replace(/[^/]*$/, ""), "");
    if (!/^\/?api\//.test(rel)) return original(input, opts);
    const metodo = ((opts && opts.method) || "GET").toUpperCase();
    if (metodo !== "GET") return json({ erro: "Demonstração somente leitura: alterações estão desativadas." }, 403);
    for (const k of [chave(rel), chave(rel.split("?")[0])]) {
      const r = await original("demo-api/" + k + ".json");
      if (r.ok) return json(await r.json());
    }
    return json({ erro: "Esta consulta não está disponível na demonstração." }, 404);
  };
  window.addEventListener("DOMContentLoaded", () => {
    const aviso = document.createElement("div");
    aviso.textContent = "Demonstração com dados fictícios · somente leitura · ";
    const a = document.createElement("a"); a.href = "https://github.com/limmuz/central-eventos"; a.textContent = "ver código no GitHub";
    a.target = "_blank"; aviso.append(a);
    aviso.style.cssText = "position:sticky;top:0;z-index:999;background:#1D4ED8;color:#fff;font:600 13px system-ui,sans-serif;text-align:center;padding:7px 10px";
    a.style.cssText = "color:#BFDBFE";
    document.body.prepend(aviso);
  });
  const baixar = (u) => {
    const arq = /docs/.test(u) ? "documentos-demo.xlsx" : /nf|budget/.test(u) ? "notas-fiscais-demo.xlsx" : "base-eventos-demo.xlsx";
    const a = document.createElement("a"); a.href = "downloads/" + arq; a.download = arq; document.body.append(a); a.click(); a.remove();
  };
  window.demoBaixar = baixar;
  // Demo: sem login. Esconde "Entrar na conta"/"Sair" e qualquer tela de acesso.
  const css = document.createElement("style");
  css.textContent = "#btn-cadeado,.lp-btn,[data-login],[data-admin]{display:none!important}";
  document.documentElement.appendChild(css);

  // links diretos para a API (ex.: "Exportar Excel", "Baixar modelo") também baixam a planilha de exemplo
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="api/"]');
    if (a) { e.preventDefault(); baixar(a.getAttribute("href")); }
  }, true);
})();
