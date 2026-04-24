export interface CalendarDayMarker {
  /** Existe treino agendado nesse dia (conforme schedule do plano). */
  scheduled?: boolean;
  /** Usuário já logou algum dado nesse dia. */
  logged?: boolean;
  /** Rótulo curto do dia (ex.: "Dia A"). */
  label?: string;
}

export interface CalendarProps {
  /** ISO date `YYYY-MM-DD` do dia selecionado. */
  selectedDate: string;
  /** ISO date `YYYY-MM-DD` do primeiro dia do mês sendo exibido. */
  monthDate: string;
  /** Markers indexados por ISO date. */
  markers?: Record<string, CalendarDayMarker | undefined>;
  /** ISO date de "hoje", permite controle do destaque em SSR. */
  today?: string;
  /** Primeiro dia da semana: 0 = Dom, 1 = Seg. */
  weekStartsOn?: 0 | 1;
  /** Locale para nomes dos meses/dias (default: pt-BR). */
  locale?: string;
  onSelectDate: (isoDate: string) => void;
  onChangeMonth?: (isoMonthDate: string) => void;
  className?: string;
}
