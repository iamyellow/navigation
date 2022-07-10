package com.navigation.reactnative;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.NVNavigationStackManagerDelegate;
import com.facebook.react.viewmanagers.NVNavigationStackManagerInterface;

import java.util.Map;

import javax.annotation.Nonnull;

@ReactModule(name = "NVNavigationStack")
public class NavigationStackViewManager extends ViewGroupManager<NavigationStackView> implements NVNavigationStackManagerInterface<NavigationStackView> {
    private final ViewManagerDelegate<NavigationStackView> delegate;

    public NavigationStackViewManager() {
        delegate = new NVNavigationStackManagerDelegate<>(this);
    }

    @Nullable
    @Override
    protected ViewManagerDelegate<NavigationStackView> getDelegate() {
        return delegate;
    }

    @Nonnull
    @Override
    public String getName() {
        return "NVNavigationStack";
    }

    @Override
    @ReactProp(name = "keys")
    public void setKeys(NavigationStackView view, ReadableArray keys) {
        view.keys = keys;
    }

    @ReactProp(name = "enterAnim")
    public void setEnterAnim(NavigationStackView view, String enterAnim) {
        view.enterAnim = enterAnim;
    }

    @ReactProp(name = "exitAnim")
    public void setExitAnim(NavigationStackView view, String exitAnim) {
        view.exitAnim = exitAnim;
    }

    @ReactProp(name = "sharedElement")
    public void setSharedElement(NavigationStackView view, String sharedElement) {
        view.sharedElementName = sharedElement;
    }

    @ReactProp(name = "oldSharedElement")
    public void setOldSharedElement(NavigationStackView view, String oldSharedElement) {
        view.oldSharedElementName = oldSharedElement;
    }

    @ReactProp(name = "mostRecentEventCount")
    public void setMostRecentEventCount(NavigationStackView view, int mostRecentEventCount) {
    }

    @ReactProp(name = "enterAnimOff")
    public void setEnterAnimOff(NavigationStackView view, boolean enterAnimOff) {
    }

    @Nonnull
    @Override
    protected NavigationStackView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new NavigationStackView(reactContext);
    }

    @Override
    public void addView(NavigationStackView parent, View child, int index) {
        SceneView scene = (SceneView) child;
        if (index > 0)
            scene.setElevation(getChildAt(parent, index - 1).getElevation() + 1);
        parent.sceneKeys.add(index, scene.sceneKey);
        parent.scenes.put(scene.sceneKey, scene);
        if (parent.startNavigation && parent.keys.size() == parent.scenes.size())
            parent.onAfterUpdateTransaction();
    }

    @Override
    public void removeViewAt(NavigationStackView parent, int index) {
        String sceneKey = parent.sceneKeys.remove(index);
        parent.scenes.remove(sceneKey);
    }

    @Override
    public int getChildCount(NavigationStackView parent) {
        return parent.scenes.size();
    }

    @Override
    public View getChildAt(NavigationStackView parent, int index) {
        return parent.scenes.get(parent.sceneKeys.get(index));
    }

    @Override
    protected void onAfterUpdateTransaction(@Nonnull NavigationStackView view) {
        super.onAfterUpdateTransaction(view);
        view.onAfterUpdateTransaction();
    }

    @Override
    public void onDropViewInstance(@NonNull NavigationStackView view) {
        view.removeFragment();
        super.onDropViewInstance(view);
    }

    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
                .put("onNavigateToTop", MapBuilder.of("registrationName", "onNavigateToTop"))
                .put("onRest", MapBuilder.of("registrationName", "onRest"))
                .build();
    }
}