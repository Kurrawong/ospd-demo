const SPARQL_ENDPOINT =
  import.meta.env.VITE_SPARQL_ENDPOINT || "https://api.ospd.dev.kurrawong.ai/sparql";

const ACTIVITY_TYPES_QUERY = `
PREFIX schema: <https://schema.org/>
PREFIX acttype: <https://w3id.org/ogc/rim/activity-type/>

SELECT ?iri ?name
WHERE {
  ?iri a acttype:ActivityType ;
       schema:name ?name .
}
ORDER BY ?name
`;

function createQuery(activityIri) {
  return `
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX acttype: <https://w3id.org/ogc/rim/activity-type/>
PREFIX ex: <http://example.org/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX regrols: <https://def.isotc211.org/codeset/RegisterRolesDemo/>
PREFIX rim: <https://w3id.org/ogc/rim/>
PREFIX schema: <https://schema.org/>

SELECT DISTINCT ?a ?n
WHERE {
    VALUES ?at { <${activityIri}> }

    ?at skos:broader* ?b .

    ?b
        a acttype:ActivityType ;
        rim:inRegister/rim:registerManager ?a .

    ?a schema:name ?n .
}
ORDER BY ?n`;
}

const form = document.querySelector("#lookup-form");
const select = document.querySelector("#activity");
const button = form.querySelector("button");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const list = document.querySelector("#organisation-list");

async function runQuery(query) {
  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ query }),
  });

  if (!response.ok) {
    throw new Error(`Prez returned HTTP ${response.status}.`);
  }

  return (await response.json()).results.bindings;
}

async function loadActivityTypes() {
  try {
    const bindings = await runQuery(ACTIVITY_TYPES_QUERY);
    select.replaceChildren();
    for (const binding of bindings) {
      select.add(new Option(binding.name.value, binding.iri.value));
    }
    const empty = bindings.length === 0;
    select.disabled = empty;
    button.disabled = empty;
    if (empty) {
      select.add(new Option("No activity types available", ""));
      status.className = "status empty";
      status.textContent = "No activity types were found.";
    }
  } catch (error) {
    select.replaceChildren(new Option("Unable to load activity types", ""));
    status.className = "status error";
    status.textContent = `Unable to load activity types: ${error.message}`;
  }
}

async function findRegisterOwners(activityIri) {
  const bindings = await runQuery(createQuery(activityIri));
  return bindings.map((binding) => ({
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
  if (select.disabled || !select.value) return;
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

loadActivityTypes();
