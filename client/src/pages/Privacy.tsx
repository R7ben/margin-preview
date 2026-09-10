export default function Privacy() {
  return (
    <div className="legal-page app-shell-light">
      <header className="legal-page-header">
        <button className="secondary-button legal-back-button" onClick={() => { window.location.href = "/" }}>← Back to app</button>
        <h1>Privacy Policy</h1>
      </header>
      <main className="legal-page-content">
        <section className="card legal-card">
          <p>This placeholder Privacy Policy explains that MARGIN is designed to keep planning information close to the user. Schedule details, check-ins, and other preview data are stored locally in the browser unless a future version clearly says otherwise.</p>
          <p>We aim to collect only what is needed to operate and improve the experience. You can clear locally stored app data through your browser settings. This policy may be expanded as the product moves beyond its preview stage.</p>
        </section>
      </main>
    </div>
  );
}
