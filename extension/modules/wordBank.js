/**
 * wordBank.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Curated word list for the Smart Password Generator.
 * Words are chosen for: memorability, length (5–9 chars), no dict-attack risk
 * when combined (the combination is unpredictable, not the words alone).
 *
 * All words are Title-cased so the generator can lowercase/uppercase freely.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const WORD_BANK = {
  tech: [
    'Quantum', 'Vector', 'Cipher', 'Binary', 'Nexus', 'Matrix', 'Kernel',
    'Vertex', 'Proxy', 'Cache', 'Packet', 'Signal', 'Lambda', 'Tensor',
    'Pixel', 'Daemon', 'Module', 'Token', 'Beacon', 'Forge', 'Syntax',
    'Cluster', 'Socket', 'Stream', 'Buffer', 'Shader', 'Codec', 'Relay',
    'Fiber', 'Switch',
  ],
  space: [
    'Nebula', 'Orbit', 'Pulsar', 'Galaxy', 'Comet', 'Aurora', 'Cosmos',
    'Quasar', 'Stellar', 'Vortex', 'Zenith', 'Eclipse', 'Solaris', 'Nova',
    'Photon', 'Lunar', 'Titan', 'Helios', 'Andromeda', 'Cassini', 'Perseid',
    'Polaris', 'Horizon', 'Equinox', 'Apogee', 'Milky', 'Meteor', 'Kepler',
    'Voyager', 'Pioneer',
  ],
  nature: [
    'Glacier', 'Tundra', 'Canyon', 'Lagoon', 'Summit', 'Cascade', 'Crimson',
    'Amber', 'Cobalt', 'Ember', 'Frost', 'Thunder', 'Blizzard', 'Torrent',
    'Geyser', 'Basalt', 'Quartz', 'Granite', 'Mantle', 'Serene', 'Ridge',
    'Ravine', 'Cavern', 'Fjord', 'Delta', 'Marsh', 'Dune', 'Savanna',
    'Plateau', 'Estuary',
  ],
  animals: [
    'Falcon', 'Tiger', 'Jaguar', 'Osprey', 'Cobra', 'Lynx', 'Condor',
    'Mantis', 'Stallion', 'Raven', 'Bison', 'Viper', 'Python', 'Rhino',
    'Crane', 'Pelican', 'Marlin', 'Badger', 'Otter', 'Ferret', 'Stag',
    'Dingo', 'Panther', 'Mamba', 'Cougar', 'Kestrel', 'Wolverine', 'Ibis',
    'Tapir', 'Ocelot',
  ],
  science: [
    'Proton', 'Neutron', 'Plasma', 'Fusion', 'Fission', 'Catalyst', 'Isotope',
    'Helium', 'Carbon', 'Lithium', 'Polymer', 'Enzyme', 'Genome', 'Neuron',
    'Synapse', 'Cortex', 'Helix', 'Prism', 'Valence', 'Kinetic', 'Resonant',
    'Entropy', 'Osmosis', 'Diffuse', 'Thermal', 'Quantum', 'Refract',
    'Inertia', 'Voltage', 'Photon',
  ],
  fantasy: [
    'Arcane', 'Relic', 'Cipher', 'Mystic', 'Rune', 'Aether', 'Shard',
    'Specter', 'Golem', 'Wraith', 'Dragon', 'Hydra', 'Titan', 'Seraph',
    'Grimoire', 'Bastion', 'Citadel', 'Aegis', 'Phantom', 'Shadow',
    'Ember', 'Tempest', 'Banshee', 'Oracle', 'Chimera', 'Griffin', 'Merlot',
    'Magus', 'Nexus', 'Raven',
  ],
  general: [
    'Rocket', 'Thunder', 'Stealth', 'Turbo', 'Prime', 'Rapid', 'Surge',
    'Blaze', 'Strike', 'Dash', 'Volt', 'Nimble', 'Apex', 'Crest', 'Edge',
    'Bold', 'Swift', 'Brave', 'Sharp', 'Keen', 'Vivid', 'Fleet', 'Keen',
    'Agile', 'Solid', 'Stark', 'Firm', 'Pure', 'Lean', 'Core',
  ],
};

/** All words flattened into a single deduplicated array. */
export const ALL_WORDS = [...new Set(Object.values(WORD_BANK).flat())];

/** Category names for the UI selector. */
export const CATEGORIES = Object.keys(WORD_BANK);
