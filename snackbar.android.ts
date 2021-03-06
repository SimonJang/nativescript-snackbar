/// <reference path="./index.d.ts" />
import { topmost } from "tns-core-modules/ui/frame";
import { Color } from "tns-core-modules/color";
import { SnackBarOptions } from "./index";

declare var android: any;

export class SnackBar {
  private _snackbar: android.support.design.widget.Snackbar;
  private _snackCallback = android.support.design.widget.Snackbar.Callback.extend(
    {
      resolve: null,
      onDismissed(snackbar, event) {
        if (event !== 1) {
          this.resolve({
            command: "Dismiss",
            reason: _getReason(event),
            event: event
          });
        }
      }
    }
  );

  public simple(
    snackText: string,
    textColor?: string,
    backgroundColor?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!snackText) {
          reject("Snack text is required.");
          return;
        }

        this._snackbar = android.support.design.widget.Snackbar.make(
          topmost().currentPage.android,
          snackText,
          3000
        );

        // set text color
        if (textColor) {
          this._setTextColor(textColor);
        }

        // set background color
        if (backgroundColor) {
          this._setBackgroundColor(backgroundColor);
        }

        const callback = new this._snackCallback();
        callback.resolve = resolve;
        this._snackbar.setCallback(callback);
        this._snackbar.show();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public action(options: SnackBarOptions) {
    return new Promise((resolve, reject) => {
      try {
        if (!options.actionText) options.actionText = "Close";
        if (!options.hideDelay) options.hideDelay = 3000;

        this._snackbar = android.support.design.widget.Snackbar.make(
          topmost().currentPage.android,
          options.snackText,
          options.hideDelay
        );

        let listener = new android.view.View.OnClickListener({
          onClick: args => {
            resolve({
              command: "Action",
              reason: _getReason(1),
              event: args
            });
          }
        });

        // set the action text, click listener
        this._snackbar.setAction(options.actionText, listener);

        // set text color
        if (options.textColor) {
          this._setTextColor(options.textColor);
        }

        // set background color
        if (options.backgroundColor) {
          this._setBackgroundColor(options.backgroundColor);
        }

        let callback = new this._snackCallback();
        callback.resolve = resolve;
        this._snackbar.setCallback(callback);
        this._snackbar.show();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public dismiss() {
    return new Promise((resolve, reject) => {
      if (this._snackbar) {
        try {
          this._snackbar.dismiss();
          // return AFTER the item is dismissed, 200ms delay
          setTimeout(() => {
            resolve({
              action: "Dismiss",
              reason: _getReason(3)
            });
          }, 200);
        } catch (ex) {
          reject(ex);
        }
      } else {
        resolve({
          action: "None",
          message: "No actionbar to dismiss"
        });
      }
    });
  }

  private _setBackgroundColor(color) {
    // set background color
    if (color) {
      const sbView = this._snackbar.getView();
      sbView.setBackgroundColor(new Color(color).android);
    }
  }

  private _setTextColor(color) {
    if (color) {
      const mainTextView = this._snackbar
        .getView()
        .findViewById(android.support.design.R.id.snackbar_text);
      mainTextView.setTextColor(new Color(color).android);
    }
  }
}

function _getReason(value) {
  if (value === 1) {
    return "Action";
  } else if (value === 4) {
    return "Consecutive";
  } else if (value === 3) {
    return "Manual";
  } else if (value === 0) {
    return "Swipe";
  } else if (value === 2) {
    return "Timeout";
  }
}
