# Prez Config data

Put data - RDF files - in here that you wish to override the standard Prez API config with. 

For example, `endpoint/` and `profiles/`, as per https://github.com/RDFLib/prez/tree/main/prez/reference_data/endpoints
and https://github.com/RDFLib/prez/tree/main/prez/reference_data/profiles respectively.

`annotations/ospd.ttl` supplies the demo term labels to Prez's local annotation
store. These match `ospd-data/resources/_background/labels.ttl`. Keeping them
available to system/profile requests prevents empty annotation lookups from
being cached before a data request can retrieve their labels from Fuseki.
