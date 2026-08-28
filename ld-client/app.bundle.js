(()=>{var u="/api/sparql";function d(n){return`
PREFIX ex: <http://example.org/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX regrols: <https://def.isotc211.org/codeset/RegisterRolesDemo/>
PREFIX schema: <https://schema.org/>

SELECT ?a ?n
WHERE {
    VALUES ?g { <${n}> }

    ?g
        a ex:GeoprocessingActivity ;
        ex:qualifiedStatus/schema:memberOf/prov:qualifiedAttribution ?attribution .

    ?attribution
        prov:agent ?a ;
        prov:hadRole regrols:register-owner .

    OPTIONAL { ?a schema:name ?label }
    BIND(COALESCE(?label, REPLACE(STR(?a), "^.*/", "")) AS ?n)
}`}var l=document.querySelector("#lookup-form"),m=document.querySelector("#activity"),i=l.querySelector("button"),t=document.querySelector("#status"),c=document.querySelector("#results"),a=document.querySelector("#organisation-list");async function p(n){let e=await fetch(u,{method:"POST",headers:{Accept:"application/sparql-results+json","Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({query:d(n)})});if(!e.ok)throw new Error(`Prez returned HTTP ${e.status}.`);return(await e.json()).results.bindings.map(r=>({iri:r.a.value,label:r.n.value}))}function g(n){a.replaceChildren();for(let e of n){let s=document.createElement("li"),r=document.createElement("strong"),o=document.createElement("a");r.textContent=e.label,o.href=e.iri,o.textContent=e.iri,o.target="_blank",o.rel="noreferrer",s.append(r,o),a.append(s)}c.hidden=!1}l.addEventListener("submit",async n=>{n.preventDefault(),i.disabled=!0,c.hidden=!0,a.replaceChildren(),t.className="status loading",t.textContent="Querying the OSPD SPARQL endpoint\u2026";try{let e=await p(m.value);if(e.length===0){t.className="status empty",t.textContent="No register-owning organisations were found.";return}g(e),t.className="status success",t.textContent=`${e.length} organisation${e.length===1?"":"s"} found.`}catch(e){console.error(e),t.className="status error",t.textContent=`Unable to complete the lookup: ${e.message}`}finally{i.disabled=!1}});})();
