export default function Terms() {
  return (
    <div className="legal-page app-shell-light">
      <header className="legal-page-header">
        <button className="secondary-button legal-back-button" onClick={() => { window.location.href = "/" }}>← Back to app</button>
        <h1>Terms &amp; Conditions</h1>
      </header>
      <main className="legal-page-content">
        <section className="card legal-card">
          <p>These placeholder Terms &amp; Conditions describe the basic expectations for using MARGIN. By using the app, you agree to use it responsibly and understand that its planning suggestions are informational tools rather than professional medical, financial, or legal advice.</p>
          <p>You are responsible for the information you enter and for the decisions you make about your schedule, commitments, and recovery. We may update these terms as the product develops, and continued use of the app after an update means you accept the revised terms.</p>
        </section>
      </main>
    </div>
  );
}
