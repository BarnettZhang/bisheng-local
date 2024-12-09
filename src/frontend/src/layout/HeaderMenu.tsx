import { TabIcon } from "@/components/bs-icons";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

export default function HeaderMenu({ }) {
    const { t } = useTranslation()
    const location = useLocation();
    console.log('location.pathname :>> ', location.pathname);
    return null;
};
