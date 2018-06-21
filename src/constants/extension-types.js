const { ExtensionAnchor, ExtensionPlatform } = window['extension-coordinator'];

const extensionTypes = {};
extensionTypes[ExtensionAnchor.Overlay] = "Overlay";
extensionTypes[ExtensionAnchor.Panel] = "Panel";
extensionTypes[ExtensionAnchor.Component] = "Component";
extensionTypes[ExtensionPlatform.Mobile] = "Mobile";

export const ExtensionAnchors = Object.freeze(extensionTypes);
export const DEFAULT_EXTENSION_TYPE = ExtensionAnchor.Overlay;
