function Loading({ text = 'Loading...' }) {
  return (
    <div className="state-screen" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  )
}

export default Loading
