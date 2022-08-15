// @ts-nocheck

function FileWithRenderProps() {
  return (
    <div>
      <Component
        renderProps={(a) => {
          return <span>{a}</span>;
        }}
      />
    </div>
  );
}
