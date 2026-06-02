alter table candidatures
  add column if not exists intitule_poste    text not null default '',
  add column if not exists rythme_travail    text,
  add column if not exists type_contrat      text,
  add column if not exists remuneration      text,
  add column if not exists contact_recruteur text,
  add column if not exists contact_coordonnees text,
  add column if not exists date_prochaine_action date;

alter table candidatures drop constraint if exists candidatures_statut_check;
alter table candidatures add constraint candidatures_statut_check
  check (statut in (
    'Envoyé','Relancé','Entretien RH','Entretien Manager 1',
    'Entretien Manager 2','Entretien Directeur',
    'Offre reçue','Offre acceptée','Offre refusée','Refusé'
  ));
