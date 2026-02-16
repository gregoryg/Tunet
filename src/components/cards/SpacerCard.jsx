/**
 * SpacerCard – a layout utility card for visual separation.
 *
 * Variants:
 *   'spacer'  – transparent empty block (visual gap)
 *   'divider' – horizontal line separator
 */

const SpacerCard = ({
  cardId,
  dragProps,
  controls,
  cardStyle,
  cardSettings,
  settingsKey,
  editMode,
  className = '',
}) => {
  const settings = cardSettings[settingsKey] || cardSettings[cardId] || {};
  const variant = settings.variant || 'spacer';

  const editClass = editMode
    ? 'border border-dashed border-[var(--glass-border)] cursor-move bg-[var(--card-bg)]/30'
    : '';

  return (
    <div
      {...dragProps}
      className={`relative rounded-3xl flex items-center justify-center h-full transition-all duration-300 ${editClass} ${className}`}
      style={editMode ? cardStyle : { ...cardStyle, backgroundColor: 'transparent', borderColor: 'transparent' }}
    >
      {controls}

      {variant === 'divider' && (
        <div className="w-full">
          <hr className="border-t border-[var(--text-muted)] opacity-30" />
        </div>
      )}
    </div>
  );
};

export default SpacerCard;
