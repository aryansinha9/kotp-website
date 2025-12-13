import React from "react";
import LogoLoop from "./LogoLoop";

const bannerLogos = [
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/worldg.svg",
        alt: "World G",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Redbull.svg",
        alt: "Red Bull",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Gemini_Generated_Image_prq78bprq78bprq7-Photoroom.svg",
        alt: "Partner Logo 1",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Gemini_Generated_Image_dm5va5dm5va5dm5v-Photoroom.svg",
        alt: "Partner Logo 2",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Gemini_Generated_Image_6vlj5u6vlj5u6vlj-Photoroom.svg",
        alt: "Partner Logo 3",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Gemini_Generated_Image_2ypzsw2ypzsw2ypz-Photoroom.svg",
        alt: "Partner Logo 4",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Gemini_Generated_Image_wef82owef82owef8-Photoroom.svg",
        alt: "Partner Logo 5",
        href: "#"
    },
    {
        src: "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Banner/Gemini_Generated_Image_huy391huy391huy3-Photoroom.svg",
        alt: "Partner Logo 6",
        href: "#"
    },
];

export default function PartnerBanner() {
    return (
        <div style={{ height: '150px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', background: '#0a0a0a' }}>
            <LogoLoop
                logos={bannerLogos}
                speed={60}
                direction="left"
                logoHeight={65}
                gap={60}
                pauseOnHover={true}
                scaleOnHover={true}
                fadeOut={true}
                fadeOutColor="#0a0a0a"
            />
        </div>
    );
}
