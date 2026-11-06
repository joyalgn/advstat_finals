import Image from "next/image";
import HomeCanvas from "../../../components/HomeCanvas";
import styles from "./about.module.css";

interface TeamMember {
  name: string;
  image?: string;
}

const teamMembers: TeamMember[] = [
  { name: "Algordo, Bernadine Joy N.", image: "/team/algordo.jpg" },
  { name: "Cabanglan, Kyle Angel T.", image: "/team/kyle.jpg" },
  { name: "Dela Gente, Franchesca", image: "/team/delagente.jpg" },
  { name: "Galang, Prince Ayen", image: "/team/galang.jpg" },
  { name: "Ilagan, Adrian Yuri M.", image: "/team/ilagan.jpg" },
  { name: "Malitig, Jimuel Ben C.", image: "/team/malitig.jpg" },
  { name: "Mercado, Alyssa Joyce", image: "/team/mercado.jpg" },
  { name: "Monzor, Jessam Mae D.", image: "/team/monzor.jpg" },
  { name: "Pedutem, Zywin Angelo B.", image: "/team/pedutem.jpg" },
  { name: "Platero, Jose Eugenio P.", image: "/team/platero.jpg" },
  { name: "Unigo, Paul Benedict G.", image: "/team/unigo.jpg" },
];

export default function AboutPage() {
  return (
    <main className={styles.aboutPage}>
      <HomeCanvas />
      <div className={styles.pageFrame}>
        <header className={styles.introduction}>
          <div className={styles.introCopy}>
            <p className={styles.eyebrow}>THE PEOPLE BEHIND STATAXIS</p>
            <h1>Meet the <em>Team.</em></h1>
            <p className={styles.introDescription}>
              STATAXIS is an interactive statistical calculator developed by BSIT 3B as part of their Advanced Statistics project. It provides tools for performing statistical calculations, analyzing data, and exploring concepts in linear regression and hypothesis testing.
            </p>
          </div>
          <div className={styles.memberCount} aria-label={`${teamMembers.length} student members`}>
            <span className={styles.countNumber}>{String(teamMembers.length).padStart(2, "0")}</span>
            <span className={styles.countLabel}>STUDENT<br />CONTRIBUTORS</span>
            <span className={styles.countRule} aria-hidden="true" />
          </div>
        </header>

        <section className={styles.instructor} aria-labelledby="instructor-heading">
          <div className={styles.instructorIndex}>
            <span>ACADEMIC GUIDANCE</span>
            <span>01 / INSTRUCTOR</span>
          </div>
          <div className={styles.instructorContent}>
            <div className={styles.instructorMonogram} aria-hidden="true">
              <span>♥</span>
              <i className={styles.monogramOrbit} />
              <i className={styles.monogramPoint} />
            </div>
            <div className={styles.instructorDetails}>
              <p className={styles.roleLabel}>COURSE INSTRUCTOR</p>
              <h2 id="instructor-heading">Ms. Melan Almendras Javier</h2>
            </div>
            <div className={styles.instructorAside}>
              <span>ADVANCED</span>
              <span>STATISTICS</span>
              <span className={styles.asideRule} aria-hidden="true" />
              <span>STATAXIS · BSIT 3B</span>
            </div>
          </div>
        </section>

        <section className={styles.contributors} aria-labelledby="contributors-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>THE CONTRIBUTION</p>
              <h2 id="contributors-heading">Student <em>contributors</em></h2>
            </div>
            <p className={styles.sectionNote}>A shared effort in learning, building, and finding direction in data.</p>
          </div>
          <div className={styles.memberGrid}>
            {teamMembers.map((member, index) => (
              <article className={styles.memberProfile} key={member.name}>
                <div className={styles.portraitFrame}>
                  <span className={styles.profileNumber}>{String(index + 1).padStart(2, "0")}</span>
                  {member.image && (
                    <Image
                      className={styles.portrait}
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 560px) 44vw, (max-width: 900px) 29vw, (max-width: 1200px) 21vw, 250px"
                    />
                  )}
                  <span className={styles.portraitCorner} aria-hidden="true" />
                </div>
                <h3>{member.name}</h3>
                <div className={styles.profileFooter}>
                  <span>STATAXIS</span>
                  <span className={styles.profileMarker} aria-hidden="true">✳</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.pageFooter}>
          <span>STATAXIS</span>
          <span>ADVANCED STATISTICS · BSIT 3B</span>
          <span>COLLABORATION, IN PRACTICE</span>
        </footer>
      </div>
    </main>
  );
}
