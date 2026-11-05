import HomeCanvas from "../../../components/HomeCanvas";

interface TeamMember {
  name: string;
  image?: string;
}

const teamMembers: TeamMember[] = [
  { name: "Algordo, Bernadine Joy N.", image: "/team/algordo.jpg"},
  { name: "Cabanglan, Kyle Angel T.", image: "/team/kyle.jpg" },
  { name: "Dela Gente, Franchesca", image: "/team/delagente.jpg"  },
  { name: "Galang, Prince Ayen", image: "/team/galang.jpg"  },
  { name: "Ilagan, Adrian Yuri M.", image: "/team/ilagan.jpg"  },
  { name: "Malitig, Jimuel Ben C.", image: "/team/malitig.jpg"  },
  { name: "Mercado, Alyssa Joyce", image: "/team/mercado.jpg"  },
  { name: "Monzor, Jessam Mae D." , image: "/team/monzor.jpg" },
  { name: "Pedutem, Zywin Angelo B.", image: "/team/pedutem.jpg"},
  { name: "Platero, Jose Eugenio P.", image: "/team/platero.jpg"  },
  { name: "Unigo, Paul Benedict G.", image: "/team/unigo.jpg"},
];

export default function AboutPage() {
  return (
    <div className="about-page" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <HomeCanvas showStatisticsGraph={false} />
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: "inherit",
            marginBottom: "15px",
          }}
        >
          MEMBERS
        </h1>
        <p style={{ color: "inherit", opacity: 0.65, fontSize: "1.1rem", margin: 0 }}>
          The members behind STATAXIS.
        </p>
      </div>

      <section className="about-class-info" aria-label="Course instructor">
        <span className="about-class-label">COURSE INSTRUCTOR</span>
        <p className="about-class-instructor">Ms. Melan Almendras Javier</p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="about-member-card"
            style={{
              backgroundColor: "rgba(42, 42, 44, 0.95)",
              border: "1px solid color-mix(in srgb, currentColor 15%, transparent)",
              borderRadius: "1rem",
              padding: "1.5rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              color: "inherit",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                overflow: "hidden",
                marginBottom: "1rem",
                border: "3px solid #f59e0b",
                backgroundColor: "color-mix(in srgb, currentColor 15%, transparent)",
              }}
            >
              {member.image && (
                <img
                  src={member.image}
                  alt={member.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>

            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "inherit",
              }}
            >
              {member.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}