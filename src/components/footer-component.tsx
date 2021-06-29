import React from "react"

export function FooterComponent() {
        return (
            <footer style={{ position: "absolute", bottom: "0", width: "100%" }}>
                <div className="container">
                    <p className="float-md-right text-center text-md-right">
                        <a href="https://arxiv.org/abs/2007.07779" target="_blank">
                            Paper
                        </a>
                        <span className="text-black-30 px-1"> | </span>
                        <a href="https://adapterhub.ml/imprint-privacy/">Imprint &amp; Privacy</a>
                    </p>
                    <p className="text-muted text-center text-md-left">Brought to you with ❤️ &nbsp;by authors from:</p>
                    <div className="text-center text-md-left logos">
                        <div className="r1">
                            <img src="images/ukp_logo.png" className="logo logo-ukp" />
                            <img src="images/tu_logo_web.svg" className="logo logo-tud" />
                        </div>
                    </div>
                </div>
            </footer>
        )
}
