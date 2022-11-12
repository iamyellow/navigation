jest.mock('navigation-react-native', () => {
    const React = require('react');
    const ReactNative = require('react-native');
    const NavigationReact = require('navigation-react');
    const NavigationReactNative = jest.requireActual('navigation-react-native');

    const Scene = ({ crumb, renderScene = (state, data) => state.renderScene(data) }) => {
        const navEvent = React.useContext(NavigationReact.NavigationContext);
        const [navigationEvent, setNavigationEvent] = React.useState(() => (
            navEvent.stateNavigator.stateContext.crumbs.length !== crumb ? null : navEvent            
        ));
        const {crumbs} = navEvent.stateNavigator.stateContext;
        const stateContext = navigationEvent?.stateNavigator?.stateContext;
        const {state, data} = stateContext || crumbs[crumb] || {};
        return !!state && (
            <NavigationReact.NavigationContext.Provider value={navigationEvent}>
                {navigationEvent && renderScene(state, data)}
            </NavigationReact.NavigationContext.Provider>
        );
    }

    const NavigationStack = ({ stackInvalidatedLink, renderScene, children }) => {
        const {stateNavigator} = React.useContext(NavigationReact.NavigationContext);
        const [stackState, setStackState] = React.useState({stateNavigator: null, keys: []});
        const scenes = {};
        let firstLink;
        const findScenes = (elements = children, nested = false) => {
            for(const scene of React.Children.toArray(elements)) {
                const {stateKey, children} = scene.props;
                if (scene.type === NavigationReactNative.Scene) {
                    firstLink = firstLink || stateNavigator.fluent().navigate(stateKey).url;
                    scenes[stateKey] = scene;
                }
                else if (!nested) findScenes(children, true)
            }
        }
        findScenes();
        const prevScenes = React.useRef({});
        const allScenes = {...prevScenes.current, ...scenes};
        React.useEffect(() => {
            prevScenes.current = allScenes;
            const {state, crumbs, nextCrumb} = stateNavigator.stateContext;
            const validate = ({key}) => !!scenes[key];
            if (firstLink) {
                stateNavigator.onBeforeNavigate(validate);
                let resetLink = !state ? firstLink : undefined;
                if (!resetLink && [...crumbs, nextCrumb].find(({state}) => !scenes[state.key]))
                    resetLink = stackInvalidatedLink != null ? stackInvalidatedLink : firstLink;
                if (resetLink != null) stateNavigator.navigateLink(resetLink);
            }
            return () => stateNavigator.offBeforeNavigate(validate);
        }, [children, stateNavigator, scenes, allScenes, stackInvalidatedLink]);
        const {stateNavigator: prevStateNavigator, keys} = stackState;
        if (prevStateNavigator !== stateNavigator && stateNavigator.stateContext.state) {
            setStackState((prevStackState) => {
                const {keys: prevKeys, stateNavigator: prevStateNavigator} = prevStackState;
                const {state, crumbs, nextCrumb, history} = stateNavigator.stateContext;
                const prevState = prevStateNavigator && prevStateNavigator.stateContext.state;
                const currentKeys = crumbs.concat(nextCrumb).map((_, i) => `${i}`);
                const newKeys = currentKeys.slice(prevKeys.length);
                const keys = prevKeys.slice(0, currentKeys.length).concat(newKeys);
                if (prevKeys.length === keys.length && prevState !== state)
                    keys[keys.length - 1] = `${keys.length - 1}`;
                const refresh = prevKeys.length === keys.length && prevState === state;
                return {keys, stateNavigator};
            });
        }
        const {crumbs, nextCrumb} = stateNavigator.stateContext;
        return crumbs.concat(nextCrumb || []).map(({ state, data }, index, {length}) => {
            renderScene = firstLink ? ({key}) => allScenes[key] : renderScene;
            return (
                <ReactNative.View
                    key={state.key}
                    accessibilityRole="window"
                    accessibilityState={{selected: index === length - 1}}>
                    <Scene crumb={index} renderScene={renderScene} />
                </ReactNative.View>
            );
        });
    }

    const NavigationBar = ({ hidden, navigationImage, title, onNavigationPress, children, ...props }) => {
        if (hidden) return null;
        const Left = React.Children.toArray(children).find(({type}) => type === NavigationReactNative.LeftBar);
        return (
            <ReactNative.View accessibilityRole="toolbar" {...props}>
                {!!navigationImage && (
                    <ReactNative.Pressable accessibilityRole="imagebutton" onPress={onNavigationPress}>
                        <ReactNative.Image source={navigationImage} />
                    </ReactNative.Pressable> 
                )}
                {!!title && (
                    <ReactNative.Text accessibilityRole="header">{title}</ReactNative.Text>
                )}
                {!Left ? <LeftBar /> : null}
                {children}
            </ReactNative.View>
        );
    };

    const LeftBar = ({children, ...props}) => {
        const {stateNavigator} = React.useContext(NavigationReact.NavigationContext);
        return (children || stateNavigator.canNavigateBack(1)) && (
            <ReactNative.View accessibilityRole="menubar" {...props}>
                {stateNavigator.canNavigateBack(1) && (
                    <ReactNative.Pressable accessibilityRole="menuitem">
                        <ReactNative.Text>Back</ReactNative.Text>
                    </ReactNative.Pressable>
                )}
                {children}
            </ReactNative.View>
        );
    };

    const RightBar = (props) => <ReactNative.View accessibilityRole="menubar" {...props} />;

    const BarButton = ({title, image, ...props}) => (
        <ReactNative.Pressable accessibilityRole="menuitem" {...props}>
            <>
                {!!title && <ReactNative.Text>{title}</ReactNative.Text>}
                {!!image && <ReactNative.Image source={image} />}
            </>
        </ReactNative.Pressable>
    );

    const TitleBar = (props) => <ReactNative.View accessibilityRole="header" {...props} />;

    const TabBar = ({tab, defaultTab = 0, onChangeTab, bottomTabs, primary = true, ...props}) => {
        const [selectedTab, setSelectedTab] = React.useState(tab || defaultTab);
        if (tab != null && tab !== selectedTab) setSelectedTab(tab);
        bottomTabs = bottomTabs != null ? bottomTabs : primary;
        const tabBarItems = React.Children.toArray(props.children).filter(child => !!child);
        const tabLayout = tabBarItems.map(({props: {title, testID, onPress}}, index) => (
            <ReactNative.Pressable
                key={index}
                testID={testID}
                accessibilityState={{selected: index === selectedTab}}
                accessibilityRole="tab"
                onPress={() => {
                    onPress();
                    if (selectedTab !== index) {
                        if (tab == null)
                            setSelectedTab(index);
                        if (!!onChangeTab)
                            onChangeTab(index);
                    }
                }} >
                <ReactNative.Text>{title}</ReactNative.Text>
            </ReactNative.Pressable>
        ));
        return (
            <>
                {!bottomTabs && tabLayout}
                <ReactNative.View accessibilityRole="tablist">
                    {tabBarItems.map((child, index) => {
                        const selected = index === selectedTab;
                        return React.cloneElement(child, {...child.props, selected})
                })}
                </ReactNative.View>
                {bottomTabs && tabLayout}
            </>
        );            
    };

    const TabBarItem = ({ selected, ...props }) => (
        <ReactNative.View
            accessibilityRole="tabpanel"
            accessibilityState={{selected}}
            {...props} />
    );

    return  {
        NavigationStack,
        Scene: NavigationReactNative.Scene,
        NavigationBar,
        LeftBar,
        RightBar,
        BarButton,
        TitleBar,
        TabBar,
        TabBarItem,
        CoordinatorLayout: ({children}) => children,
    };
});
