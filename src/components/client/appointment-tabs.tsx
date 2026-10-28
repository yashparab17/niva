"use client";

import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

const tab =
  "cursor-pointer rounded-full px-5 py-2 text-sm font-medium text-muted-foreground outline-none transition data-focus-visible:ring-3 data-focus-visible:ring-ring/40 data-selected:bg-primary data-selected:text-primary-foreground";

type Props = { upcoming: React.ReactNode; past: React.ReactNode; upcomingCount: number; pastCount: number };

export function AppointmentTabs({ upcoming, past, upcomingCount, pastCount }: Props) {
  return (
    <Tabs>
      <TabList aria-label="Appointments" className="inline-flex gap-1 rounded-full bg-muted p-1">
        <Tab id="upcoming" className={tab}>
          Upcoming ({upcomingCount})
        </Tab>
        <Tab id="past" className={tab}>
          Past ({pastCount})
        </Tab>
      </TabList>
      <TabPanel id="upcoming" className="mt-6 animate-in fade-in slide-in-from-bottom-1 outline-none duration-300">
        {upcoming}
      </TabPanel>
      <TabPanel id="past" className="mt-6 animate-in fade-in slide-in-from-bottom-1 outline-none duration-300">
        {past}
      </TabPanel>
    </Tabs>
  );
}
