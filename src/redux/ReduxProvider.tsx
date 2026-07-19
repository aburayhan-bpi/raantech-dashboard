// "use client";

// import { ChildrenProps } from "@/types/global";
// import { Provider } from "react-redux";
// import { store } from "./store";

// // Auth initializer component

// const ReduxProvider = ({ children }: ChildrenProps) => {
//   return <Provider store={store}>{children}</Provider>;
// };

// export default ReduxProvider;

"use client";

import { ChildrenProps } from "@/types/global";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";

const ReduxProvider = ({ children }: ChildrenProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
