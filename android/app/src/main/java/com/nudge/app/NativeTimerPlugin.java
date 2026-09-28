package com.nudge.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.provider.AlarmClock;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Phase 2: Native Android AlarmClock.ACTION_SET_TIMER intent plugin
 * 
 * Redirects to the OS's native Clock/Timer app:
 * - EXTRA_LENGTH: duration in seconds
 * - EXTRA_MESSAGE: label/title
 * - EXTRA_SKIP_UI: true to immediately start countdown without confirmation
 * 
 * Catches ActivityNotFoundException when no Clock app is available.
 */
@CapacitorPlugin(name = "NativeTimer")
public class NativeTimerPlugin extends Plugin {

    @PluginMethod
    public void setTimer(PluginCall call) {
        Integer durationSeconds = call.getInt("durationSeconds");
        if (durationSeconds == null || durationSeconds <= 0) {
            call.reject("durationSeconds must be a positive integer");
            return;
        }

        String label = call.getString("label", "Nudge Focus Timer");
        Boolean skipUi = call.getBoolean("skipUi", true);

        try {
            Intent intent = new Intent(AlarmClock.ACTION_SET_TIMER);
            intent.putExtra(AlarmClock.EXTRA_LENGTH, durationSeconds);
            if (label != null && !label.trim().isEmpty()) {
                intent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
            }
            intent.putExtra(AlarmClock.EXTRA_SKIP_UI, skipUi != null && skipUi);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getContext().startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("method", "ANDROID_INTENT");
            ret.put("durationSeconds", durationSeconds);
            ret.put("label", label);
            call.resolve(ret);
        } catch (ActivityNotFoundException e) {
            // Clock app not installed on device / emulator
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("reason", "NO_CLOCK_APP");
            ret.put("error", e.getMessage());
            call.resolve(ret);
        } catch (SecurityException e) {
            // Missing SET_ALARM permission or security restriction
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("reason", "SECURITY_EXCEPTION");
            ret.put("error", e.getMessage());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to set native timer: " + e.getMessage(), e);
        }
    }
}
