/// Relative time in Portuguese, ported from the web's `getTimeAgo`
/// (`apps/web/src/shared/hooks/useGetTimeAgo.ts`) so both clients label the
/// same instant the same way.
///
/// It returns only the amount ("3 dias"), without the "ha " prefix — the web
/// renders it as `ha ${timeAgo}`, and callers here do the same.
///
/// The buckets are the web's, including its quirks: weeks come from whole
/// days / 7 while months come from days / 30 and years from days / 365, so the
/// boundaries are approximate on purpose. Keep them in step with the web.
String timeAgo(DateTime date, {DateTime? now}) {
  final reference = now ?? DateTime.now();
  final seconds = reference.difference(date.toLocal()).inSeconds;

  if (seconds < 60) {
    return 'agora';
  }

  final minutes = seconds ~/ 60;
  if (minutes < 60) {
    return '$minutes ${minutes == 1 ? 'minuto' : 'minutos'}';
  }

  final hours = minutes ~/ 60;
  if (hours < 24) {
    return '$hours ${hours == 1 ? 'hora' : 'horas'}';
  }

  final days = hours ~/ 24;
  if (days < 7) {
    return '$days ${days == 1 ? 'dia' : 'dias'}';
  }

  final weeks = days ~/ 7;
  if (weeks < 4) {
    return '$weeks ${weeks == 1 ? 'semana' : 'semanas'}';
  }

  final months = days ~/ 30;
  if (months < 12) {
    return '$months ${months == 1 ? 'mês' : 'meses'}';
  }

  final years = days ~/ 365;
  return '$years ${years == 1 ? 'ano' : 'anos'}';
}
