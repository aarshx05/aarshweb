import SectionHead from '@/components/SectionHead'

export default function Skills({ data }) {
  if (!data?.length) return null

  return (
    <section className="section" id="skills">
      <div className="container">
        <SectionHead
          index="04"
          eyebrow="Capabilities"
          title="Skills &"
          accent="tooling."
          lede="What I reach for day to day, grouped by the kind of problem it solves."
        />

        <div className="skill-groups reveal">
          {data.map((category) => (
            <div className="skill-group" key={category.label}>
              <h3>{category.label}</h3>
              <div className="chip-row">
                {(category.skills || []).map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
