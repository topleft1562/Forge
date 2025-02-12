export default function GradientText({
  children,
  className = "",
  colors = ["#83c3e1", "#4088ae", "#00e1ff", "#4088ae", "#4088ae"],
  animationSpeed = 4,
  showBorder = false,
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div className={`animated-gradient-text ${className}`}>
      {showBorder && <div className="gradient-overlay" style={gradientStyle}></div>}
      <div className="text-content" style={gradientStyle}>{children}</div>
    </div>
  );
} 