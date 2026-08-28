const SPARQL_ENDPOINT = "/api/sparql";

function createQuery(activityIri) {
  return `
PREFIX ex: <http://example.org/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX regrols: <https://def.isotc211.org/codeset/RegisterRolesDemo/>
PREFIX schema: <https://schema.org/>

SELECT ?a ?n
WHERE {
    VALUES ?g { <${activityIri}> }

    ?g
        a ex:GeoprocessingActivity ;
        ex:qualifiedStatus/schema:memberOf/prov:qualifiedAttribution ?attribution .

    ?attribution
        prov:agent ?a ;
        prov:hadRole regrols:register-owner .

    OPTIONAL { ?a schema:name ?label }
    BIND(COALESCE(?label, REPLACE(STR(?a), "^.*/", "")) AS ?n)
}`;
}

const form = document.querySelector("#lookup-form");
const select = document.querySelector("#activity");
const button = form.querySelector("button");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const list = document.querySelector("#organisation-list");

async function findRegisterOwners(activityIri) {
  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ query: createQuery(activityIri) }),
  });

  if (!response.ok) {
    throw new Error(`Prez returned HTTP ${response.status}.`);
  }

  const result = await response.json();
  return result.results.bindings.map((binding) => ({
    iri: binding.a.value,
    label: binding.n.value,
  }));
}

function renderOrganisations(organisations) {
  list.replaceChildren();

  for (const organisation of organisations) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const link = document.createElement("a");
    name.textContent = organisation.label;
    link.href = organisation.iri;
    link.textContent = organisation.iri;
    link.target = "_blank";
    link.rel = "noreferrer";
    item.append(name, link);
    list.append(item);
  }

  results.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  button.disabled = true;
  results.hidden = true;
  list.replaceChildren();
  status.className = "status loading";
  status.textContent = "Querying the OSPD SPARQL endpoint…";

  try {
    const organisations = await findRegisterOwners(select.value);

    if (organisations.length === 0) {
      status.className = "status empty";
      status.textContent = "No register-owning organisations were found.";
      return;
    }

    renderOrganisations(organisations);
    status.className = "status success";
    status.textContent = `${organisations.length} organisation${organisations.length === 1 ? "" : "s"} found.`;
  } catch (error) {
    console.error(error);
    status.className = "status error";
    status.textContent = `Unable to complete the lookup: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});
