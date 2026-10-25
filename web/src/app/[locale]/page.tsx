import { Clientes } from "@/components/sections/Clientes";
import { Contacto } from "@/components/sections/Contacto";
import { Enfoque } from "@/components/sections/Enfoque";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { PorQue } from "@/components/sections/PorQue";
import { Proceso } from "@/components/sections/Proceso";
import { Proyectos } from "@/components/sections/Proyectos";
import { QueHacemos } from "@/components/sections/QueHacemos";
import { Sectores } from "@/components/sections/Sectores";
import { Servicios } from "@/components/sections/Servicios";
import { Sobre } from "@/components/sections/Sobre";

// Prototype order (design-system.md §7).
export default function HomePage() {
  return (
    <main id="contenido">
      <Hero />
      <Marquee />
      <QueHacemos />
      <Servicios />
      <Proceso />
      <Sectores />
      <PorQue />
      <Enfoque />
      <Proyectos />
      <Clientes />
      <Sobre />
      <Contacto />
    </main>
  );
}
