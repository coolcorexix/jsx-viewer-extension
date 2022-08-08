// @ts-nocheck
import React from "react";

function SelfClose() {
  return (
    <div>
      <Trans
        t={t}
        i18nKey="library.topbar.notification.createShortcut.duplicateInFolder"
        values={{ folderName: propsDuplicateModal.folderName }}
        components={[<b />]}
      />
      <a />
    </div>
  );
}
