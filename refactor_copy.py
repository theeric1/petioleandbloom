import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Newsletter Form
old_newsletter = """<form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required"""
new_newsletter = """<form action="https://api.web3forms.com/submit" method="POST" style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY_HERE" />
                  <input type="hidden" name="subject" value="New Newsletter Subscription from Petiole & Bloom" />
                  <input type="hidden" name="redirect" value="https://web3forms.com/success" />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Enter email address"
                    required"""
content = content.replace(old_newsletter, new_newsletter)

# 2. Update Contact Form
old_contact = """<form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
                        <input 
                          type="text" 
                          required"""
new_contact = """<form action="https://api.web3forms.com/submit" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY_HERE" />
                      <input type="hidden" name="redirect" value="https://web3forms.com/success" />
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
                        <input 
                          type="text"
                          name="name" 
                          required"""
content = content.replace(old_contact, new_contact)

# Add names to other contact form fields
content = content.replace('type="email" \n                          required', 'type="email" \n                          name="email"\n                          required')
content = content.replace('<select \n                          style={{', '<select \n                          name="subject"\n                          style={{')
content = content.replace('<textarea \n                          rows={5} \n                          required', '<textarea \n                          name="message"\n                          rows={5} \n                          required')

# 3. Add Instagram link to Footer
old_footer = """<div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="https://petioleandbloomllc.etsy.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                Etsy Store
              </a>
              <span>USDA Nursery Registered</span>"""
new_footer = """<div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="https://instagram.com/petioleandbloomllc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                Instagram
              </a>
              <a href="https://petioleandbloomllc.etsy.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                Etsy Store
              </a>
              <span>USDA Nursery Registered</span>"""
content = content.replace(old_footer, new_footer)

# 4. Refine the Copy
# Hero Copy
content = content.replace("Propagators of rare tropical botanical specimens and synthesizers of gentle, supportive skin serums.", "We propagate established, rare botanical specimens and formulate clinical-grade copper peptide complexes. No fluff, just vigorous roots and proven active ingredients.")
content = content.replace("A modern botanical nursery and nourishing personal care apothecary. Nurturing healthy plants and formulating supportive personal care products to help you grow.", "A botanical nursery and clinical apothecary. We focus on well-established root systems and scientifically-proven copper peptide formulations.")

# Rewrite Petioles & Peptides Narrative to sound more natural and less "AI"
old_narrative = """In nature, the <strong>petiole</strong> is the stalk connecting a leaf to its stem, carrying nutrients that help the plant flourish. Similarly, <strong>peptides</strong> are small chains of amino acids that support the skin's natural renewal and elasticity. 
                  </p>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    At Petiole & Bloom, we enjoy bringing these two aspects of growth together—caring for rare, beautiful plants and formulating gentle, nourishing skin and scalp products."""

new_narrative = """The <strong>petiole</strong> is the structural stalk that connects a leaf to its stem, delivering water and nutrients to keep the plant vigorous. <strong>Peptides</strong> are structural amino acid chains that signal human skin and hair cells to synthesize collagen, repair tissue, and grow. 
                  </p>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    Petiole & Bloom is the intersection of these two forms of structural growth. We are horticulturists obsessing over the root health of variegated bananas and orchids, and we are formulators working with clinical-grade GHK-Cu copper peptides to support skin and scalp health."""
content = content.replace(old_narrative, new_narrative)

# Science Tab rewrite and adding FAQ + Clinical Studies
old_science = """<p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  At Petiole & Bloom, we believe in transparent ingredients and healthy cultivation. Here is a brief look at the principles behind our offerings.
                </p>
              </div>

              {/* Deck */}"""
new_science = """<p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  We prioritize rigorous root establishment for our botanicals and peer-reviewed active ingredients for our serums. Here is exactly how we cultivate and formulate.
                </p>
              </div>

              {/* Deck */}"""
content = content.replace(old_science, new_science)

# Add FAQ Section below the Science Grid
old_science_grid = """</section>
        )}

        {/* ================= ABOUT TAB ================= */}"""

faq_section = """
              {/* FAQ & Clinical Research */}
              <div style={{ marginTop: '5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Clinical Research & Frequently Asked Questions</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  
                  {/* Clinical Studies */}
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>GHK-Cu Copper Peptide Studies</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      We utilize GHK-Cu (glycyl-L-histidyl-L-lysine copper) at clinical concentrations. It is one of the most thoroughly researched peptides in dermatology.
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li>
                        <a href="https://pubmed.ncbi.nlm.nih.gov/29986520/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--brand-primary)' }}>
                          Regenerative and Protective Actions of the GHK-Cu Peptide (Pickart et al.)
                        </a>
                      </li>
                      <li>
                        <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6073405/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--brand-primary)' }}>
                          GHK Peptide as a Natural Modulator of Multiple Cellular Pathways
                        </a>
                      </li>
                      <li>
                        <a href="https://pubmed.ncbi.nlm.nih.gov/17709082/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--brand-primary)' }}>
                          The Effect of Copper Peptides on Hair Growth
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* FAQ */}
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Nursery & Shipping FAQ</h3>
                    
                    <div style={{ marginBottom: '1.2rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.3rem' }}>How do you ship live plants securely?</strong>
                      <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>We ship via USPS Priority or UPS depending on your location. Plants are carefully wrapped in sphagnum moss or soil plugs. During winter, we automatically include thermal insulation and heat packs at no extra charge if your destination is below 40°F.</p>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.3rem' }}>What if my plant arrives damaged?</strong>
                      <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>We guarantee live arrival. If your specimen arrives dead or severely damaged by the carrier, message us within 24 hours with photos of the plant and box. We will issue a replacement or refund immediately.</p>
                    </div>

                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Can I use the Copper Peptide serum with Vitamin C or Retinol?</strong>
                      <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>Copper peptides should generally NOT be layered directly with strong L-Ascorbic Acid (Vitamin C) or direct acids (AHAs/BHAs) in the same routine, as it can degrade the peptide bonds. Alternate them (e.g., Vitamin C in the morning, GHK-Cu at night).</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= ABOUT TAB ================= */}"""

content = content.replace(old_science_grid, faq_section)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Forms and Copy Refactored")
