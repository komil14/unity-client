import { Card, Section } from "../../../libs/shared/ui";
import { useScrollToTop } from "../../hooks/useScrollToTop";

export default function HelpPage() {
  useScrollToTop();
  return (
    <div>
      <Section title="Help" description="Quick answers for Unity.">
        <Card>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Getting started</div>
          <div
            style={{
              marginTop: 8,
              color: "var(--text-muted)",
              lineHeight: 1.7,
            }}
          >
            - Create an account or login to join events and groups.
            <br />- Explore Events, Groups, and Organizers from the top
            navigation.
            <br />- If something fails to load, make sure the backend is
            running.
          </div>
        </Card>
      </Section>
    </div>
  );
}
