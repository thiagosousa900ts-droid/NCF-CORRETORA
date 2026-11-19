export const AGE_BANDS = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"] as const;

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export const CONTRACT_TYPES = ["Individual/Familiar", "Coletivo empresarial", "Coletivo por adesão", "PME", "Empresarial"];
export const SEGMENTATIONS = [
  "Ambulatorial",
  "Hospitalar com obstetrícia",
  "Hospitalar sem obstetrícia",
  "Ambulatorial + hospitalar com obstetrícia",
  "Ambulatorial + hospitalar sem obstetrícia",
  "Referência",
];
export const ACCOMMODATIONS = ["Enfermaria", "Apartamento"];
export const COVERAGE_AREAS = ["Municipal", "Grupo de municípios", "Estadual", "Grupo de estados", "Nacional"];
export const COPAY_MODALITIES = ["Sem coparticipação", "Coparticipação parcial", "Coparticipação total"];

export const VALIDATION_LABEL = {
  confirmado: "Confirmado",
  nao_disponivel: "Não disponível",
  pendente_validacao: "Pendente de validação",
} as const;
export type ValidationStatus = keyof typeof VALIDATION_LABEL;

export const NETWORK_TYPE_LABEL = {
  hospital: "Hospital",
  laboratorio: "Laboratório",
  clinica: "Clínica",
  outro: "Outro",
} as const;
export type NetworkType = keyof typeof NETWORK_TYPE_LABEL;

export const CHANNEL_LABEL = {
  telefone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  reuniao: "Reunião",
  outro: "Outro",
} as const;
export type Channel = keyof typeof CHANNEL_LABEL;

export const PAGE_SIZE = 20;
