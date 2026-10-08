import { ArrowUpRight, BookOpenText, ExternalLink, LifeBuoy, Radio, Scale, Watch } from "lucide-react";

const resources = [
  {
    title: "Ovok documentation",
    description: "Set up projects, practitioner accounts, access policies, and the web SDK.",
    href: "https://docs.ovok.com",
    icon: BookOpenText,
    label: "docs.ovok.com",
  },
  {
    title: "Ovok platform",
    description: "Learn about the platform and Actimi’s Ovok products.",
    href: "https://ovok.com",
    icon: LifeBuoy,
    label: "ovok.com",
  },
  {
    title: "@ovok/core on npm",
    description: "Review the current package version, API surface, and installation notes.",
    href: "https://www.npmjs.com/package/@ovok/core",
    icon: Radio,
    label: "npmjs.com/package/@ovok/core",
  },
];

export default function SupportPage() {
  return (
    <div className="content-stack">
      <section className="page-heading">
        <div>
          <h1>Support</h1>
          <p className="page-subtitle">Documentation for setting up this Ovok example with its companion app.</p>
        </div>
      </section>

      <section className="support-intro">
        <div className="support-intro-icon"><LifeBuoy size={21} /></div>
        <div>
          <h2>Set up your Ovok sandbox project</h2>
          <p>Create an Ovok account, create one sandbox project, enable practitioner sign-in, and grant the clinician the documented patient and Signals read access.</p>
        </div>
        <a className="button button-primary" href="https://docs.ovok.com/authentication/project-setup" target="_blank" rel="noreferrer">
          Project setup guide <ExternalLink size={14} />
        </a>
      </section>

      <section>
        <div className="section-heading">
          <div><h2>Ovok resources</h2><p>Follow the official documentation for current setup details.</p></div>
        </div>
        <div className="resource-grid">
          {resources.map(({ title, description, href, icon: Icon, label }) => (
            <a className="resource-card" href={href} target="_blank" rel="noreferrer" key={title}>
              <span className="resource-icon"><Icon size={18} /></span>
              <span className="resource-title">{title}</span>
              <span className="resource-description">{description}</span>
              <span className="resource-link">{label}<ArrowUpRight size={15} /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="device-section">
        <div className="section-heading">
          <div><h2>Companion app devices</h2><p>The mobile application records measurements. This dashboard reads them after they reach Ovok.</p></div>
        </div>
        <div className="device-grid">
          <article className="device-card">
            <span className="device-icon"><Radio size={19} /></span>
            <div><h3>Viatom BP2</h3><p>ECG and blood pressure monitor. Confirm the exact model and approved instructions for use before deployment.</p></div>
            <div className="device-links">
              <a href="https://storage.googleapis.com/public-assets-com-expo-app/instruction-pdf/instruction_armfit.pdf" target="_blank" rel="noreferrer">BP2 / Armfit IFU <ExternalLink size={13} /></a>
              <a href="https://www.viatomtech.com/bp2" target="_blank" rel="noreferrer">Manufacturer page <ExternalLink size={13} /></a>
            </div>
          </article>
          <article className="device-card">
            <span className="device-icon"><Scale size={19} /></span>
            <div><h3>Viatom F4 / LeScale</h3><p>The companion app selects the F4 SDK declaration. Check the device label and current catalog; the LeScale family has multiple models.</p></div>
            <div className="device-links">
              <a href="https://storage.googleapis.com/public-assets-com-expo-app/instruction-pdf/instruction_scales.pdf" target="_blank" rel="noreferrer">Scale IFU <ExternalLink size={13} /></a>
              <a href="https://www.viatomtech.com/bodyscale" target="_blank" rel="noreferrer">Manufacturer page <ExternalLink size={13} /></a>
            </div>
          </article>
          <article className="device-card device-note">
            <span className="device-icon"><Watch size={19} /></span>
            <div><h3>Pairing happens in mobile</h3><p>This clinician dashboard does not connect to Bluetooth devices or replace manufacturer instructions.</p></div>
            <a href="https://docs.ovok.com/native-sdk/guide/supported-devices" target="_blank" rel="noreferrer">Ovok device catalog <ExternalLink size={13} /></a>
          </article>
        </div>
      </section>

      <div className="clinical-note">
        <strong>Documentation example</strong>
        <span>Patient names and readings in the demo workspace are synthetic. This example is not for clinical use and does not provide medical advice.</span>
      </div>
    </div>
  );
}
