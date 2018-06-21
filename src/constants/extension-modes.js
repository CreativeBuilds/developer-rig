const { ExtensionViewType, ExtensionMode } = window['extension-coordinator'];

let modeToView = {}
modeToView[ExtensionMode.Config] = ExtensionViewType.Config;
modeToView[ExtensionMode.Dashboard] = ExtensionViewType.LiveConfig;
modeToView[ExtensionViewType.Mobile] = ExtensionViewType.Mobile;

export const EXTENSION_MODE_TO_VIEW = Object.freeze(modeToView);
