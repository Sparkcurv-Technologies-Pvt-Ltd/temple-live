import { AiOutlineDashboard } from "react-icons/ai";
import { MenuText } from "@layout/Partials/Style";

export const investorItem = (collapsed, permissionsGet) => {
    function getItem(label, key, icon, children, type) {
        return {
            key,
            icon,
            children,
            label,
            type,
        };
    }

    let items = [
        getItem(
            <MenuText>{collapsed ? null : ""}</MenuText>,
            "menu",
            null,
            [
                getItem("Investor Dashboard", "", <AiOutlineDashboard />),

            ], 'group'),
    ]


    return items;
};
export const investorKeys = [
    "sub1",
];
