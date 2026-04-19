import type { Exercise } from '@/core/domain';

/**
 * Local exercise catalog.
 *
 * Source of truth for now — mirrors the schema of the future `exercises_catalog`
 * Supabase table so the swap is a drop-in replacement:
 *   const { data } = await supabase.from('exercises_catalog').select('*');
 */
export const exerciseDatabase: Exercise[] = [
  // ─── Peito ───────────────────────────────────────────────────────────────────
  { id: 'supino-reto-barra', name: 'Supino reto com barra', category: 'Peito', type: 'strength' },
  { id: 'supino-inclinado-barra', name: 'Supino inclinado com barra', category: 'Peito', type: 'strength' },
  { id: 'supino-inclinado-maquina', name: 'Supino inclinado na máquina', category: 'Peito', type: 'strength' },
  { id: 'supino-declinado-barra', name: 'Supino declinado com barra', category: 'Peito', type: 'strength' },
  { id: 'supino-declinado-maquina', name: 'Supino declinado na máquina', category: 'Peito', type: 'strength' },
  { id: 'supino-reto-halter', name: 'Supino reto com halteres', category: 'Peito', type: 'strength' },
  { id: 'supino-reto-maquina', name: 'Supino reto na máquina', category: 'Peito', type: 'strength' },
  { id: 'supino-inclinado-halter', name: 'Supino inclinado com halteres', category: 'Peito', type: 'strength' },
  { id: 'crucifixo-reto', name: 'Crucifixo reto', category: 'Peito', type: 'strength' },
  { id: 'crucifixo-inclinado', name: 'Crucifixo inclinado', category: 'Peito', type: 'strength' },
  { id: 'crossover', name: 'Cross-over', category: 'Peito', type: 'strength' },
  { id: 'fly-maquina', name: 'Fly na máquina (peck deck)', category: 'Peito', type: 'strength' },
  { id: 'flexao-bracos', name: 'Flexão de braços', category: 'Peito', type: 'strength' },
  { id: 'pullover', name: 'Pullover com halter', category: 'Peito', type: 'strength' },

  // ─── Costas ──────────────────────────────────────────────────────────────────
  { id: 'puxada-frontal', name: 'Puxada frontal', category: 'Costas', type: 'strength' },
  { id: 'puxada-triangulo', name: 'Puxada com triângulo', category: 'Costas', type: 'strength' },
  { id: 'puxada-supinada', name: 'Puxada supinada', category: 'Costas', type: 'strength' },
  { id: 'puxada-unilateral-supinada', name: 'Puxada unilateral supinada', category: 'Costas', type: 'strength' },
  { id: 'puxada-articulado', name: 'Puxada articulado', category: 'Costas', type: 'strength' },
  { id: 'remada-curvada', name: 'Remada curvada com barra', category: 'Costas', type: 'strength' },
  { id: 'remada-unilateral', name: 'Remada unilateral com halter', category: 'Costas', type: 'strength' },
  { id: 'remada-cavalinho', name: 'Remada cavalinho', category: 'Costas', type: 'strength' },
  { id: 'remada-baixa', name: 'Remada baixa no cabo', category: 'Costas', type: 'strength' },
  { id: 'remada-t', name: 'Remada T', category: 'Costas', type: 'strength' },
  { id: 'barra-fixa', name: 'Barra fixa (pull-up)', category: 'Costas', type: 'strength' },
  { id: 'gravitron', name: 'Gravitron', category: 'Costas', type: 'strength' },
  { id: 'terra', name: 'Levantamento terra', category: 'Costas', type: 'strength' },
  { id: 'pulldown', name: 'Pulldown', category: 'Costas', type: 'strength' },
  { id: 'hiperextensao', name: 'Hiperextensão lombar', category: 'Costas', type: 'strength' },
  { id: 'serrote', name: 'Serrote', category: 'Costas', type: 'strength' },
  { id: 'serrote-unilateral', name: 'Serrote unilateral', category: 'Costas', type: 'strength' },
  { id: 'remada-smith', name: 'Remada no Smith', category: 'Costas', type: 'strength' },

  // ─── Ombros ──────────────────────────────────────────────────────────────────
  { id: 'desenvolvimento-barra', name: 'Desenvolvimento com barra', category: 'Ombros', type: 'strength' },
  { id: 'desenvolvimento-halter', name: 'Desenvolvimento com halteres', category: 'Ombros', type: 'strength' },
  { id: 'desenvolvimento-arnold', name: 'Desenvolvimento Arnold', category: 'Ombros', type: 'strength' },
  { id: 'desenvolvimento-smith', name: 'Desenvolvimento Smith', category: 'Ombros', type: 'strength' },
  { id: 'elevacao-lateral', name: 'Elevação lateral', category: 'Ombros', type: 'strength' },
  { id: 'elevacao-lateral-cabo', name: 'Elevação lateral no cabo', category: 'Ombros', type: 'strength' },
  { id: 'elevacao-lateral-halter', name: 'Elevação lateral com halteres', category: 'Ombros', type: 'strength' },
  { id: 'elevacao-frontal', name: 'Elevação frontal', category: 'Ombros', type: 'strength' },
  { id: 'elevacao-em-y', name: 'Elevação em Y', category: 'Ombros', type: 'strength' },
  { id: 'crucifixo-inverso', name: 'Crucifixo inverso', category: 'Ombros', type: 'strength' },
  { id: 'encolhimento', name: 'Encolhimento com halteres', category: 'Ombros', type: 'strength' },
  { id: 'face-pull', name: 'Face pull', category: 'Ombros', type: 'strength' },
  { id: 'remada-alta', name: 'Remada alta', category: 'Ombros', type: 'strength' },

  // ─── Bíceps ──────────────────────────────────────────────────────────────────
  { id: 'rosca-direta-barra', name: 'Rosca direta com barra reta', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-direta-ez', name: 'Rosca direta com barra W', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-alternada', name: 'Rosca alternada com halteres', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-martelo', name: 'Rosca martelo', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-concentrada', name: 'Rosca concentrada', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-scott', name: 'Rosca Scott', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-cabo', name: 'Rosca no cabo', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-inclinada', name: 'Rosca inclinada com halteres', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-45', name: 'Rosca 45°', category: 'Bíceps', type: 'strength' },
  { id: 'rosca-spyder', name: 'Rosca spyder', category: 'Bíceps', type: 'strength' },

  // ─── Tríceps ─────────────────────────────────────────────────────────────────
  { id: 'triceps-pulley', name: 'Tríceps no pulley (corda)', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-barra-reta', name: 'Tríceps no pulley (barra reta)', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-testa', name: 'Tríceps testa', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-testa-inclinado', name: 'Tríceps testa inclinado', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-frances-halter', name: 'Tríceps francês com halter', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-frances', name: 'Tríceps francês', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-frances-polia', name: 'Tríceps francês na polia', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-banco', name: 'Tríceps no banco', category: 'Tríceps', type: 'strength' },
  { id: 'triceps-coice', name: 'Tríceps coice', category: 'Tríceps', type: 'strength' },
  { id: 'mergulho-paralelas', name: 'Mergulho em paralelas', category: 'Tríceps', type: 'strength' },
  { id: 'supino-fechado', name: 'Supino fechado', category: 'Tríceps', type: 'strength' },

  // ─── Antebraço ───────────────────────────────────────────────────────────────
  { id: 'rosca-punho', name: 'Rosca de punho', category: 'Antebraço', type: 'strength' },
  { id: 'rosca-punho-inversa', name: 'Rosca de punho inversa', category: 'Antebraço', type: 'strength' },
  { id: 'rosca-inversa-barra', name: 'Rosca inversa com barra', category: 'Antebraço', type: 'strength' },

  // ─── Quadríceps ──────────────────────────────────────────────────────────────
  { id: 'agachamento-livre', name: 'Agachamento livre', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-smith', name: 'Agachamento no Smith', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-hack', name: 'Agachamento hack', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-frontal', name: 'Agachamento frontal', category: 'Quadríceps', type: 'strength' },
  { id: 'leg-press-45', name: 'Leg press 45°', category: 'Quadríceps', type: 'strength' },
  { id: 'leg-press-horizontal', name: 'Leg press horizontal', category: 'Quadríceps', type: 'strength' },
  { id: 'cadeira-extensora', name: 'Cadeira extensora', category: 'Quadríceps', type: 'strength' },
  { id: 'passada', name: 'Passada / Avanço', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-bulgaro', name: 'Agachamento búlgaro', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-bulgaro-quadriceps', name: 'Agachamento búlgaro quadríceps', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-bulgaro-step', name: 'Agachamento búlgaro no step', category: 'Quadríceps', type: 'strength' },
  { id: 'agachamento-bulgaro-smith', name: 'Agachamento búlgaro no Smith', category: 'Quadríceps', type: 'strength' },
  { id: 'afundo-estatico', name: 'Afundo estático', category: 'Quadríceps', type: 'strength' },
  { id: 'afundo-passo-frente', name: 'Afundo com passo à frente', category: 'Quadríceps', type: 'strength' },
  { id: 'afundo-passo-tras', name: 'Afundo com passo para trás', category: 'Quadríceps', type: 'strength' },
  { id: 'afundo-step', name: 'Afundo com step', category: 'Quadríceps', type: 'strength' },
  { id: 'sissy-squat', name: 'Sissy squat', category: 'Quadríceps', type: 'strength' },

  // ─── Posterior ───────────────────────────────────────────────────────────────
  { id: 'mesa-flexora', name: 'Mesa flexora', category: 'Posterior', type: 'strength' },
  { id: 'cadeira-flexora', name: 'Cadeira flexora', category: 'Posterior', type: 'strength' },
  { id: 'stiff', name: 'Stiff', category: 'Posterior', type: 'strength' },
  { id: 'terra-romeno', name: 'Levantamento terra romeno', category: 'Posterior', type: 'strength' },
  { id: 'bom-dia', name: 'Good morning (bom dia)', category: 'Posterior', type: 'strength' },
  { id: 'nordic-curl', name: 'Nordic curl', category: 'Posterior', type: 'strength' },

  // ─── Glúteos ─────────────────────────────────────────────────────────────────
  { id: 'hip-thrust', name: 'Hip thrust', category: 'Glúteos', type: 'strength' },
  { id: 'elevacao-pelvica', name: 'Elevação pélvica', category: 'Glúteos', type: 'strength' },
  { id: 'abdutora', name: 'Cadeira abdutora', category: 'Glúteos', type: 'strength' },
  { id: 'agachamento-bulgaro-gluteos', name: 'Agachamento búlgaro (Glúteos)', category: 'Quadríceps', type: 'strength' },
  { id: 'adutora', name: 'Cadeira adutora', category: 'Glúteos', type: 'strength' },
  { id: 'kickback-gluteo', name: 'Kickback de glúteo', category: 'Glúteos', type: 'strength' },
  { id: 'agachamento-sumo', name: 'Agachamento sumô', category: 'Glúteos', type: 'strength' },

  // ─── Panturrilha ─────────────────────────────────────────────────────────────
  { id: 'panturrilha-em-pe', name: 'Panturrilha em pé (máquina)', category: 'Panturrilha', type: 'strength' },
  { id: 'panturrilha-sentado', name: 'Panturrilha sentado', category: 'Panturrilha', type: 'strength' },
  { id: 'panturrilha-leg-press', name: 'Panturrilha no leg press', category: 'Panturrilha', type: 'strength' },
  { id: 'panturrilha-smith', name: 'Panturrilha no Smith', category: 'Panturrilha', type: 'strength' },

  // ─── Abdômen ─────────────────────────────────────────────────────────────────
  { id: 'abdominal-crunch', name: 'Abdominal crunch', category: 'Abdômen', type: 'strength' },
  { id: 'abdominal-infra', name: 'Abdominal infra', category: 'Abdômen', type: 'strength' },
  { id: 'abdominal-obliquo', name: 'Abdominal oblíquo', category: 'Abdômen', type: 'strength' },
  { id: 'prancha-frontal', name: 'Prancha frontal', category: 'Abdômen', type: 'strength' },
  { id: 'prancha-lateral', name: 'Prancha lateral', category: 'Abdômen', type: 'strength' },
  { id: 'abdominal-maquina', name: 'Abdominal na máquina', category: 'Abdômen', type: 'strength' },
  { id: 'elevacao-pernas', name: 'Elevação de pernas suspensas', category: 'Abdômen', type: 'strength' },
  { id: 'roda-abdominal', name: 'Roda abdominal', category: 'Abdômen', type: 'strength' },

  // ─── Cardio ──────────────────────────────────────────────────────────────────
  { id: 'esteira', name: 'Esteira', category: 'Cardio', type: 'cardio' },
  { id: 'esteira-corrida', name: 'Corrida na esteira', category: 'Cardio', type: 'cardio' },
  { id: 'esteira-caminhada', name: 'Caminhada na esteira', category: 'Cardio', type: 'cardio' },
  { id: 'bike-ergometrica', name: 'Bike ergométrica', category: 'Cardio', type: 'cardio' },
  { id: 'transport', name: 'Transport / Elíptico', category: 'Cardio', type: 'cardio' },
  { id: 'escada', name: 'Escada (stairmaster)', category: 'Cardio', type: 'cardio' },
  { id: 'remo-ergometrico', name: 'Remo ergométrico', category: 'Cardio', type: 'cardio' },
  { id: 'corda-pular', name: 'Pular corda', category: 'Cardio', type: 'cardio' },
  { id: 'spinning', name: 'Spinning', category: 'Cardio', type: 'cardio' },

  // ─── Corpo inteiro ───────────────────────────────────────────────────────────
  { id: 'burpee', name: 'Burpee', category: 'Corpo inteiro', type: 'strength' },
  { id: 'clean-press', name: 'Clean and press', category: 'Corpo inteiro', type: 'strength' },
  { id: 'snatch', name: 'Snatch (arranco)', category: 'Corpo inteiro', type: 'strength' },
  { id: 'kettlebell-swing', name: 'Kettlebell swing', category: 'Corpo inteiro', type: 'strength' },
  { id: 'turkish-getup', name: 'Turkish get-up', category: 'Corpo inteiro', type: 'strength' },
];

/** All unique categories, in display order. */
export const EXERCISE_CATEGORIES = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Quadríceps',
  'Posterior',
  'Glúteos',
  'Panturrilha',
  'Abdômen',
  'Cardio',
  'Corpo inteiro',
] as const;

/** Returns exercises filtered by category. */
export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exerciseDatabase.filter((e) => e.category === category);
}

/** Returns a single exercise by id, or undefined if not found. */
export function getExerciseById(id: string): Exercise | undefined {
  return exerciseDatabase.find((e) => e.id === id);
}
