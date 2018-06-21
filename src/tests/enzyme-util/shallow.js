import React from 'react';
import { shallow } from 'enzyme';

/**
 * Builds the shallow wrapper for a component given defaults set in a test suite, and allowing overrides for each case.
 * @param {*} Component
 * @param {*} generator
 * @param {*} shallowOptions
 */
export function setupShallowTest(Component, generator, shallowOptions) {
  return (propOverrides) => {
    const combinedProps = Object.assign({}, generator(), propOverrides);
    return {
      props: combinedProps,
      wrapper: shallow((<Component {...combinedProps} />), shallowOptions),
    }
  }
}
