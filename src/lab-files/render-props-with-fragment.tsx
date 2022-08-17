// @ts-nocheck

function FileWithRenderProps() {
  return (
    <>
      <Component
        renderProps={(a) => {
          return <span>{a}</span>;
        }}
      />
    </>
  );
}
