/**
 * Singleton guard enforcing exactly three active Crew Lead slots at the domain level.
 */
export class CrewLeadRegistry {
  private static instance: CrewLeadRegistry | undefined;

  private constructor(private maxSlots: number) {}

  static getInstance(maxSlots = 3): CrewLeadRegistry {
    if (!CrewLeadRegistry.instance) {
      CrewLeadRegistry.instance = new CrewLeadRegistry(maxSlots);
    }
    return CrewLeadRegistry.instance;
  }

  /** For tests: reset singleton between runs */
  static resetForTests(): void {
    CrewLeadRegistry.instance = undefined;
  }

  canRegisterCrewLead(currentCrewLeadCount: number): boolean {
    return currentCrewLeadCount < this.maxSlots;
  }
}
