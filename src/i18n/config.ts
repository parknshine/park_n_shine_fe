import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import idCommon from "@/locales/id/common.json";
import idCustomer from "@/locales/id/customer.json";
import idCrew from "@/locales/id/crew.json";
import idAdmin from "@/locales/id/admin.json";
import enCommon from "@/locales/en/common.json";
import enCustomer from "@/locales/en/customer.json";
import enCrew from "@/locales/en/crew.json";
import enAdmin from "@/locales/en/admin.json";

i18n.use(initReactI18next).init({
  lng: "id",
  fallbackLng: "id",
  supportedLngs: ["id", "en"],
  ns: ["common", "customer", "crew", "admin"],
  defaultNS: "common",
  resources: {
    id: { common: idCommon, customer: idCustomer, crew: idCrew, admin: idAdmin },
    en: { common: enCommon, customer: enCustomer, crew: enCrew, admin: enAdmin },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
