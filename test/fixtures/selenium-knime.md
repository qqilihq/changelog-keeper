# Changelog

This log gives an overview of the most prominent changes in each release. Minor fixes, changes “under the hood” and refactoring changes are not listed here. We follow the <a href="http://semver.org">Semantic Versioning</a> scheme and the guidelines from <a href="https://keepachangelog.com">“Keep a Changelog”</a> as close as possible.

<!-- placeholder - do not remove! - insert new entries below! -->

## version-5.13.9 – 2026-10-04

### Changed
* Update driver binaries (ChromeDriver 154.0.8037.98/154.0.8037.97, Microsoft WebDriver (Chromium) 154.0.4258.53)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.49.0</a>
* Updated bundled Chrome to version 154.0.8037.92

### Fixed
* The Selenium data types made KNIME log a <tt>CODING PROBLEM</tt> error the first time the type conversions used by the <b>Java Snippet</b> node were touched — <i>DataCellToJavaFactory name “WebElement” … Factory will not be registered.</i> The conversions themselves always worked; the message came from a duplicate which Java generates behind the scenes, and it is gone.
* <b>Take Full Page Screenshot</b> produced images larger than the page, on screens whose pixel ratio is above 1 — a Retina display, say. The node read the page size in device pixels and then applied the scale factor to it a second time, so an unscaled screenshot of a 2400 pixel page came out 4800 pixels tall with the lower half empty. <b>Images from this node change size:</b> a scale factor of 1 now means one image pixel per CSS pixel on every machine, so a screenshot taken on a Retina display comes out half the size it used to, and the same size as one taken anywhere else.
* <b>Take Full Page Screenshot</b> lost 15 pixels of the requested width on Windows and Linux. The emulated screen drew a scrollbar in the platform’s style, and a classic scrollbar takes that width out of the area the page lays out in — so a screenshot asked to be 1600 pixels wide came out 1585 there, while the same workflow on macOS, where scrollbars are overlays, gave 1600. The same 15 pixels went missing from a screenshot taken without an explicit width. The scrollbar is never in the picture anyway, so the node now asks for an overlay one — which takes no space — on every platform.
* <b>Take Full Page Screenshot</b> left its screen emulation switched on when it finished, so a second one in the same workflow inherited the first one’s enlarged window and grew again — the sizes doubling with each node in the chain, and depending on the order they ran in. The emulation is now cleared when the node is done.
* <b>Take Full Page Screenshot:</b> two of these nodes working on the same browser at the same time — which KNIME does when they hang off the same predecessor — captured under each other’s screen emulation, and came out the same size. The node now has the browser to itself while it captures.
* <b>And</b> and <b>Or</b> lost the connection of their output whenever a condition port was added or removed. The output is now kept.
* <b>Solve Image Captcha</b> failed with a <tt>ClassCastException</tt> on images of 40&nbsp;KB and more, which KNIME stores in a different kind of cell than smaller ones. Images of any size are now read.
* <b>Solve Image Captcha</b> made a node downstream which uses its <tt>imageCaptchaSolution</tt> flow variable — a <b>Send Keys</b> typing the solution, say — complain about an unknown variable until the captcha had been solved. The variable now exists, empty, as soon as the node is configured. The node also no longer fails when its input table already has a column of the name it appends.
* <b>Logging</b> saved the Gecko driver’s log level in the place of the Edge driver’s, so the Edge level was lost and both drivers got the Gecko one. Each level is now saved on its own. <b>In existing workflows, set both levels again:</b> the Gecko level starts at “INFO”, and the Edge level still holds what was chosen for Gecko.
* A row whose input cell was missing, with “Remove input column” ticked: <b>Send Keys</b>, <b>Send File Path</b>, <b>Send Credentials</b> and <b>Drag and Drop</b> failed with a <tt>NegativeArraySizeException</tt>, and <b>Extract Attribute</b>, <b>Extract CSS Property</b> and <b>Extract Text</b> kept the input column in that row, so each cell after it ended up in the column before — the extracted value under another column’s name, and a missing cell where the extracted value belonged. Such a row now has the input column removed and missing cells where the method’s output would be, like every other row.

## version-5.13.8 – 2026-09-02

### Changed
* Update driver binaries (ChromeDriver 152.0.7977.76/152.0.7977.75, Microsoft WebDriver (Chromium) 152.0.4191.53)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.48.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.47.0">4.47.0</a>
* Updated bundled Chrome to version 152.0.7977.75

## version-5.13.7 – 2026-08-07

### Changed
* Update driver binaries (ChromeDriver 151.0.7922.109/151.0.7922.108, Microsoft WebDriver (Chromium) 151.0.4129.72, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.37.1">0.37.1</a>)
* Updated bundled Chrome to version 151.0.7922.77
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.46.0</a>

## version-5.13.6 – 2026-07-03

### Changed
* Update driver binaries (ChromeDriver 150.0.7871.47/150.0.7871.46, Microsoft WebDriver (Chromium) 150.0.4078.50/150.0.4078.48, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.37.0">0.37.0</a>)
* Updated bundled Chrome to version 150.0.7871.46

## version-5.13.5 – 2026-06-06

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.44.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.44.0">4.44.0</a>
* Update driver binaries (ChromeDriver 148.0.7778.217/148.0.7778.216/148.0.7778.215, Microsoft WebDriver (Chromium) 148.0.3967.96)
* Updated bundled Chrome to version 149.0.7827.54

## version-5.13.4 – 2026-05-02

### Changed
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.43.0">4.43.0</a>
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.43.0</a>
* Update driver binaries (ChromeDriver 147.0.7727.138/147.0.7727.137, Microsoft WebDriver (Chromium) 147.0.3912.98)

## version-5.13.3 – 2026-04-04

### Changed
* Update driver binaries (ChromeDriver 146.0.7680.178/146.0.7680.177, Microsoft WebDriver (Chromium) 146.0.3856.97)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.41.0</a>
* Updated bundled Chrome to version 147.0.7727.50

### Fixed
* <b>Window Actions:</b> Removed “Switch to window/tab by index”

### Deprecated
* <b>Window Actions:</b> Replaced with a new version

## version-5.13.2 – 2026-03-02

### Fixed
* Find Elements: Potential resource leak in due to broken listener cleanup

### Changed
* Update driver binaries (ChromeDriver 145.0.7632.116/145.0.7632.117, Microsoft WebDriver (Chromium) 145.0.3800.82)
* Updated bundled Chrome to version 146.0.7680.31

## version-5.13.1 – 2026-02-08

### Fixed
* Revert to ChromeDriver 144.0.7559.96 - the previously released version is still in “early stable” state and not rolled out globally (see [here](https://forum.knime.com/t/error-start-webdriver-chrome-version/91373/1))

## version-5.13.0 – 2026-02-04

### Added
* <b>Window Actions:</b> New node to work with window and tabs - open, close and switch tabs and windows.

### Changed
* <b>Window:</b> Rename existing node to “Window Size” to avoid confusions with newly added “Window Actions”.
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.40.0</a>
* Update driver binaries (ChromeDriver 145.0.7632.46, Microsoft WebDriver (Chromium) 144.0.3719.104)

## version-5.12.2 – 2026-01-04

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.39.0</a>
* Update driver binaries (ChromeDriver 143.0.7499.169, Microsoft WebDriver (Chromium) 143.0.3650.96)
* Update bundled Chrome to 143.0.7499.169

## version-5.12.1 – 2025-12-10

### Fixed
* Find Elements: Fix check if the browser is running in headless mode.

### Changed
* Update driver binaries (ChromeDriver 143.0.7499.40,Microsoft WebDriver (Chromium) 143.0.3650.75/143.0.3650.66)

## version-5.12.0 – 2025-11-13

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.38.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.36.1">4.36.1</a>
* Update driver binaries (ChromeDriver 142.0.7444.162,Microsoft WebDriver (Chromium) 142.0.3595.76/142.0.3595.65)

### Added
* <b>Send Credentials:</b> New node to send values from credential variables similar to the “Send Keys” node.

## version-5.11.5 – 2025-10-05

### Changed
* Update driver binaries (ChromeDriver 141.0.7390.54,Microsoft WebDriver (Chromium) 141.0.3537.57)

## version-5.11.4 – 2025-09-05

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.35.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.35.0">4.35.0</a>
* Update driver binaries (ChromeDriver 140.0.7339.80,Microsoft WebDriver (Chromium) 139.0.3405.125)
* Update bundled Chrome to 140.0.7339.80

## version-5.11.3 – 2025-08-03

### Changed
* Update driver binaries (ChromeDriver 138.0.7204.183, Microsoft WebDriver (Chromium) 138.0.3351.121)

## version-5.11.2 – 2025-07-04

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.34.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.33.0">4.33.0</a>
* Update driver binaries (ChromeDriver 138.0.7204.92, Microsoft WebDriver (Chromium) 138.0.3351.65)
* Update bundled Chrome to 138.0.7204.92

## version-5.11.1 – 2025-06-02

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.33.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.32.0">4.32.0</a>
* Update driver binaries (ChromeDriver 137.0.7151.55, Microsoft WebDriver (Chromium) 136.0.3240.76)

## version-5.11.0 – 2025-05-04

### Changed
* <b>Generate TOTP:</b> Allow to extract TOTP URI from QR code
* Update driver binaries (ChromeDriver 136.0.7103.49, Microsoft WebDriver (Chromium) 136.0.3240.50)
* Update bundled Chrome to 135.0.7049.114

## version-5.10.0 – 2025-04-06

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.31.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.30.0">4.30.0</a>
* Update driver binaries (ChromeDriver 135.0.7049.42, Microsoft WebDriver (Chromium) 135.0.3179.54)

### Added
* <b>Generate TOTP:</b> New node to generate Time-based One-Time Passwords.

## version-5.9.4 – 2025-03-02

### Changed
* Update to NodePit Licensing Plugin 1.3.1
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.29.0</a>
* Update driver binaries (ChromeDriver 133.0.6943.141, Microsoft WebDriver (Chromium) 133.0.3065.92, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.36.0">0.36.0</a>)
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.29.0">4.29.0</a>
* Update bundled Chrome to 133.0.6943.141

## version-5.9.3 – 2025-02-02

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.28.1</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.28.0">4.28.0</a>
* Update driver binaries (ChromeDriver 132.0.6834.159, Microsoft WebDriver (Chromium) 132.0.2957.140)

## version-5.9.2 – 2025-01-02

### Changed
* Update driver binaries (ChromeDriver 131.0.6778.204, Microsoft WebDriver (Chromium) 131.0.2903.112)
* Update bundled Chrome to 131.0.6778.204

## version-5.9.1 – 2024-12-06

### Changed
* Update driver binaries (ChromeDriver 131.0.6778.87, Microsoft WebDriver (Chromium) 131.0.2903.86)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.27.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.27.0">4.27.0</a>

## version-5.9.0 – 2024-11-02

### Added
* Conditional control flow nodes: <b>Alert Is Present</b>, <b>Attribute Matches</b>, <b>Number of Elements</b>, <b>Text Matches</b>, <b>URL Matches</b>, <b>And</b>, <b>Not</b>, <b>Or</b>, <b>Wait for Condition</b> (see e.g. [here](https://forum.knime.com/t/web-scraping-looping-over-a-details-page/12920/8), [here](https://forum.knime.com/t/selenium-wait-node-add-option-to-wait-for-element/81974/7))

### Fixed
* <b>Clear</b>, <b>Click</b>, <b>Drag and Drop</b>, <b>Extract Attribute</b>, <b>Extract CSS Property</b>, <b>Extract Text</b>, <b>Send File</b>, <b>Send Keys</b>, <b>Submit</b>: Prevent losing input column configuration if has been configured before and it’s temporarily missing (see [here](https://forum.knime.com/t/selenium-input-column-lost-if-name-changed/82806); kudos to mwiegand)

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.26.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.25.0">4.25.0</a>
* Update driver binaries (ChromeDriver 130.0.6723.91, Microsoft WebDriver (Chromium) 130.0.2849.68)
* Update bundled Chrome to 130.0.6723.91

## version-5.8.4 – 2024-10-02

### Changed
* Automatically update outdated update site URLs to the current KNIME version
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.25.0</a>
* Update driver binaries (ChromeDriver 129.0.6668.89, Microsoft WebDriver (Chromium) 129.0.2792.65)
* Update bundled Chrome to 129.0.6668.89

### Fixed
* <b>Solve reCAPTCHA and hCaptcha:</b> Fix for [callback](https://2captcha.com/demo/recaptcha-v2-callback)-based reCAPTCHAv2

## version-5.8.3 – 2024-09-02

### Fixed
* <b>Find Elements:</b> Load proper poll interval when opening dialog (see [here](https://forum.knime.com/t/selenium-find-node-wait-value-lost/81993)) – kudos to mwiegand
* <b>Logging:</b> Use KNIME’s temporary directory (see [here](https://forum.knime.com/t/selenium-logger-logs-with-huge-delay-cache-at-play/82051))
* <b>Logging:</b> Clean up temporary directory when closing the workflow (see [here](https://forum.knime.com/t/selenium-logger-logs-with-huge-delay-cache-at-play/82051))
* <b>Logging:</b> Ensure that logging configuration gets reset on node reset or workflow close

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.24.0</a>
* Update driver binaries (ChromeDriver 128.0.6613.119, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.35.0">0.35.0</a>, Microsoft WebDriver (Chromium) 128.0.2739.54)

## version-5.8.2 – 2024-08-02

### Changed
* Update driver binaries (ChromeDriver 127.0.6533.88, Microsoft WebDriver (Chromium) 127.0.2651.86)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.23.0</a>
* Update bundled Chrome to 127.0.6533.88

### Added
* <b>WebDriver Factory, Start WebDriver:</b> Add capability snippet to disable Chrome’s search engine choice screen (see [here](https://forum.knime.com/t/chrome-prompts-to-chose-defautl-search-engine/81338))

## version-5.8.1 – 2024-07-02

### Changed
* Update driver binaries (ChromeDriver 126.0.6478.126, Microsoft WebDriver (Chromium) 126.0.2592.81)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.22.0</a>

## version-5.8.0 – 2024-06-02

### Fixed
* <b>Network Dump Start</b> and <b>Network Dump End</b>: Prevent writing duplicated temp files - kudos to mwiegand
* <b>Network Dump Start</b> and <b>Network Dump End</b>: Clean up temporary files already when closing the workflow (and not only when quitting KNIME) - kudos to mwiegand
* <b>Undetected Chrome</b>: Further fix for proxy configuration (when more than one proxy is set)
* <b>Undetected Chrome</b>: Allow to configure custom data directory using <code>--user-data-dir</code>
* Ensure that <code>unhandledPromptBehavior</code> is properly passed in case of Chrome-based browsers - kudos to <a href="https://forum.knime.com/t/selenium-click-behaviour-doesnt-mimic-manual-click-outcome/79751">zovanti</a>
* Fix supplying Chrome extensions via Capabilities
* <b>Undetected Chrome</b>: Prevent detection of headless mode
* Prevent duplicated WebDriver options in dropdown menus

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.21.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.21.0">4.21.0</a>
* Update driver binaries (ChromeDriver 125.0.6422.141, Microsoft WebDriver (Chromium) 125.0.2535.79)
* Allow to turn-off auto-dismissal of alerts in Chrome-based browsers and Firefox via <a href="https://www.selenium.dev/documentation/webdriver/drivers/options/#unhandledpromptbehavior">capabilities</a> and add “Don’t auto-dismiss alerts” snippet
* Update bundled Chrome to 125.0.6422.141
* <b>Undetected Chrome</b>: Remove “Chrome for Testing (bundled, undetected)” setting - instead please use the dedicated “Start Undetected WebDriver” node from now on
* Add migration logic to update undetected WebDriver configurations in existing workflows
* <b>WebDriver Factory</b>: Update links in description and provide additional information

### Added
* <b>Start WebDriver</b>, <b>WebDriver Factory</b>: Allow to edit raw JSON capability data.
* <b>Table Extractor</b>: Allow to specify which text property to use (innerHTML, outerHTML, innerText, textContent)

### Deprecated
* <b>Undetected Chrome</b>: Deprecated “Chrome for Testing (bundled, undetected)” WebDriver setting

## version-5.7.1 – 2024-05-02

### Changed
* Update bundled Chrome to 124.0.6367.60
* Update driver binaries (ChromeDriver 124.0.6367.91)

### Fixed
* <b>Timed WebDriver Reconnect:</b> Fix loading of settings
* Fix proxy configuration for “undetected” Chrome
* Show proxy configuration capability snippet when selecting “undetected” Chrome
* Verify proper browser startup in undetected Chrome mode

## version-5.7.0 – 2024-04-21

### Changed
* Update driver binaries (ChromeDriver 123.0.6312.122, Microsoft WebDriver (Chromium) 123.0.2420.97)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.19.1</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/4.19.1">4.19.1</a>

### Added 
* <b>Timed WebDriver Navigate:</b> Node for undetected navigation (part of “Undetected Chrome Utilities” addon)

## version-5.6.1 – 2024-03-22

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.18.1</a>
* Update driver binaries (ChromeDriver 123.0.6312.58, Microsoft WebDriver (Chromium) 122.0.2365.106)

## version-5.6.0 – 2024-02-05

### Added
* Solve Image Captcha: New node to solve plain image captchas using the 2Captcha API

### Changed

* Update driver binaries (ChromeDriver 121.0.6167.85, Microsoft WebDriver (Chromium) 121.0.2277.98)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.17.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.17.0">4.17.0</a>
* Update bundled Chrome to 121.0.6167.85
* Rename “Solve Captcha” to “Solve reCAPTCHA and hCaptcha”

### Fixed
* Solve Captcha: Fix for error “'Runtime.evaluate' wasn't found”

## version-5.5.0 – 2024-01-22

### Changed

* Update driver binaries (ChromeDriver 120.0.6099.109, Microsoft WebDriver (Chromium) 120.0.2210.144, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.34.0">0.34.0</a>)
* Remove obsolete feature `ws.palladian.nodes.selenium.driver.chromium.feature.feature.group` upon installation – it was replaced with Chrome for Testing (`ws.palladian.nodes.selenium.chrome.feature.feature.group`)
* Update bundled Chrome to 120.0.6099.109

### Added
* New, highly experimental utilities for running “undetected” – install via feature <b>Undetected Chrome Utilities</b>. It consists of a dedicated “undetected“ Chrome WebDriver and a set of nodes: <b>Disconnect WebDriver</b>, <b>Reconnect WebDriver</b>, and <b>Timed WebDriver Reconnect</b>). This is beta functionality – your <a href="mailto:mail@seleniumnodes.com?subject=Undetected">feedback</a> is welcome!

## version-5.4.1 – 2023-12-19

### Fixed
* Migration logic for deprecated “Click” node

## version-5.4.0 – 2023-12-18

### Info
* Requires at least KNIME 4.7 (please make sure you’re using an update site URL corresponding to your KNIME version)
* <b>Note:</b> We’re currently evaluating for how long we’re going to support KNIME 4.7 and your opinion matters – if you’re deliberately <b>not</b> upgrading to KNIME 5 (for now), please let us know!

### Changed
* <b>Authenticate (HTTP Basic):</b> Support for credentials variables
* Update driver binaries (Microsoft WebDriver (Chromium) 120.0.2210.77, ChromeDriver 120.0.6099.71)
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.16.1</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.15.1">4.15.1</a>
* <b>Click</b>: Support further click types: Left click, right click, double click

## version-5.3.0 – 2023-11-18

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.15.0</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.14.1">4.14.1</a>
* Update bundled Chrome to 119.0.6045.105
* Update driver binaries (Microsoft WebDriver (Chromium) 119.0.2151.72)

### Added
* <b>Logging:</b> New node to configure logging for debugging and support purposes

## version-5.2.2 – 2023-11-05

### Changed
* Update driver binaries (ChromeDriver 119.0.6045.105, Microsoft WebDriver (Chromium) 118.0.2088.76)

## version-5.2.1 – 2023-10-24

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.14.1</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.13.0">4.13.0</a>
* Update driver binaries (ChromeDriver 118.0.5993.70, Microsoft WebDriver (Chromium) 118.0.2088.61)

## version-5.2.0 – 2023-09-27

### Changed
* Update driver binaries (ChromeDriver 117.0.5938.92, Microsoft WebDriver (Chromium) 117.0.2045.43/117.0.2045.40)

### Added
* <b>Authentication (HTTP Basic):</b> New node to configure HTTP Basic authentication

### Fixed
* Fix issue “Could not start a new session. Possible causes are invalid address of the remote server or browser start-up failure.” when running Edge

## version-5.1.3 – 2023-09-10

### Changed
* Update driver binaries (ChromeDriver 116.0.5845.96, Microsoft WebDriver (Chromium) 116.0.1938.76)
* Update bundled Chrome to 116.0.5845.96
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.12.1</a>
* Update HtmlUnit 3 Driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.12.0">4.12.0</a>

### Fixed
* Show capability snippets if **Chrome for Testing (bundled)** is used

## version-5.1.2 – 2023-08-10

### Changed
* Update driver binaries (ChromeDriver 115.0.5790.170, Microsoft WebDriver (Chromium) 115.0.1901.200)

### Fixed
* Fix issue “cannot find Chrome binary” when starting Chrome browser  (see [here](https://groups.google.com/g/chromedriver-users/c/PXWZDEx6KKE), [here](https://bugs.chromium.org/p/chromium/issues/detail?id=1466427))

## version-5.1.1 – 2023-07-23

### Fixed
* Fix “Could not start a new session.” when starting a Firefox browser (caused by invalid capabilities structure)

## version-5.1.0 – 2023-07-20

### Changed
* Replacing bundled Chromium with [“Chrome for Testing”](https://developer.chrome.com/blog/chrome-for-testing/)
* Update bundled Chrome to 115.0.5790.98
* Works with KNIME 5.1
* Update driver binaries (ChromeDriver 115.0.5790.98, Microsoft WebDriver (Chromium) 114.0.1823.86)

### Added
* <b>Input License Key:</b> Node which allows to set the license key (as an alternative way to the KNIME preferences; useful if you’re having issues to set the license on a KNIME Server; see [here](https://forum.knime.com/t/knime-server-selenium-license-issues/64016))

### Fixed
* <b>Execute JavaScript:</b> JSON handling on KNIME 5.1

## version-5.0.2 – 2023-06-15

### Changed
* Update Selenium to <a href="https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG">4.10.0</a>
* Update HtmlUnitDriver to <code>htmlunit3-driver</code> <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/htmlunit3-driver-4.9.1">4.9.1</a> (now uses HtmlUnit 3.x instead of HtmlUnit 2.70)
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/114.0.5735.90/notes.txt">114.0.5735.90</a>, Microsoft WebDriver (Chromium) 113.0.1774.57)
* Use `--headless=new` in Chrome headless capability snippet

## version-5.0.1 – 2023-05-15

### Changed

* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/113.0.5672.63/notes.txt">113.0.5672.63</a>, Microsoft WebDriver (Chromium) 113.0.1774.42)

## version-5.0 – 2023-04-16

### Added
* <b>Network Dump Start</b> and <b>Network Dump End</b>: New nodes to capture network traffic

### Changed
* Update Selenium to <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/java/CHANGELOG">4.8.3</a>
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2023/04/stable-channel-update-for-desktop.html">112.0.5615.49</a>
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/112.0.5615.49/notes.txt">112.0.5615.49</a>, Microsoft WebDriver (Chromium) 112.0.1722.34, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.33.0">0.33.0</a>)

### Removed
* Opera which is no longer supported by Selenium (see [here](https://www.selenium.dev/selenium/docs/api/javascript/page/Changes.html))
* Remove Marionette web driver
* Removed “Parse HTML source” DOM outline strategy (ensure to chose a different one in the preferences)
* Removed deprecated “Edge driver (Legacy)” – please switch to “Edge (Chromium)”
* Removed deprecated PhantomJS – use headless Chrome or Firefox instead

## version-4.12.2 – 2023-03-14

### Fixed
* Fix issues caused by incompatible API changes in Chrome 111 and newer (affects e.g. “Find Elements” preview, “Cookies”, etc.)

### Changed
* Get rid of separate dependencies plugin
* Works with current KNIME 5.0 nightly
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/111.0.5563.64/notes.txt">111.0.5563.64</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.110.0.5481.100">110.0.5481.100</a>, Microsoft WebDriver (Chromium) 111.0.1661.41)

## version-4.12.1 – 2023-02-19

### Changed

* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/110.0.5481.77/notes.txt">110.0.5481.77</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.109.0.5414.120">109.0.5414.120</a>, Microsoft WebDriver (Chromium) 110.0.1587.50, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.32.2">0.32.2</a>)

## version-4.12.0 – 2023-01-23

### Changed

* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/109.0.5414.74/notes.txt">109.0.5414.74</a>, Microsoft WebDriver (Chromium) 109.0.1518.61)

### Added
* Support for Apple Silicon aka. ARM: Bundle native driver binaries and Chromium (except: deprecated PhantomJS; Opera which currently provides no binaries) – kudos to Sarah for testing and the valuable feedback!
* <b>Solve Captcha:</b> New node for automatically solving ReCaptcha and hCaptcha using the 2Captcha API – currently labeled as “beta” — your <a href="mailto:mail@seleniumnodes.com?subject=Solve%20Captcha">feedback</a> is welcome! (kudos to <a href="https://twitter.com/armingrudd">@armingrudd</a>)

## version-4.11.1 – 2022-12-23

### Info
* Requires at least KNIME 4.5 (please make sure you’re using an update site URL corresponding to your KNIME version)

### Changed

* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/108.0.5359.71/notes.txt">108.0.5359.71</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.108.0.5359.99">108.0.5359.99</a>, Microsoft WebDriver (Chromium) 108.0.1462.54)

## version-4.11.0 – 2022-11-19

### Fixed
* Find Elements: Prevent unbound horizontal growth of dialog in case of long selector suggestions

### Changed
* <b>Cookies:</b> Allow to delete cookies ([feedback](https://forum.knime.com/t/get-cookies-from-incognito-impossible/48852/3?u=qqilihq) by mwiegand, thank you!)
* <b>Cookies:</b> Only return relevant columns depending on selected method
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/107.0.5304.62/notes.txt">107.0.5304.62</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.107.0.5304.88">107.0.5304.88</a>, Microsoft WebDriver (Chromium) 107.0.1418.52)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2022/11/stable-channel-update-for-desktop.html">107.0.5304.110</a>

### Deprecated
* <b>Get Cookies:</b> Replaced with “Cookies” node

## version-4.10.1 – 2022-10-25

### Fixed
* <b>Get Cookies:</b> Fix node description
* Remove unneeded dependencies

## version-4.10.0 – 2022-10-24

### Added
* <b>Get Cookies:</b> New node to get cookies

### Changed

* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/106.0.5249.61/notes.txt">106.0.5249.61</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.106.0.5249.119">106.0.5249.119</a>, Microsoft WebDriver (Chromium) 106.0.1370.52, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.32.0">0.32.0</a>)
* Find Elements: Show query suggestions based on id, class, name attributes and tag names

## version-4.9.4 – 2022-09-21

### Fixed
* <b>Execute JavaScript:</b> Allow returning JSON arrays

### Changed
* Update driver binaries (OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.105.0.5195.102">105.0.5195.102</a>, Microsoft WebDriver (Chromium) 105.0.1343.42)

## version-4.9.3 – 2022-09-09

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/105.0.5195.52/notes.txt">105.0.5195.52</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.104.0.5112.81">104.0.5112.81</a>, Microsoft WebDriver (Chromium) 105.0.1343.27)

## version-4.9.2 – 2022-08-14

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/104.0.5112.79/notes.txt">104.0.5112.79</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.103.0.5060.66">103.0.5060.66</a>, Microsoft WebDriver 104.0.1293.54)
* <b>Start WebDriver:</b> Increase the default timeouts for page load and scripts from 10 seconds to 60 seconds

## version-4.9.1 – 2022-07-06

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/103.0.5060.53/notes.txt">103.0.5060.53</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.102.0.5005.61">102.0.5005.61</a>, Microsoft WebDriver 103.0.1264.37)

## version-4.9 – 2022-06-12

### Info
* Requires at least KNIME 4.4 (please make sure you’re using an <a href="/download">update site URL</a> corresponding to your KNIME version)

### Added
* Support Chromium-based Edge (Windows, macOS)
* <b>WebDriver Factory</b> and <b>Start WebDriver:</b> Capability snippet example from mobile emulation with Chrome (see [here](https://forum.knime.com/t/selenium-how-to-emulate-mobile-device/43465))

### Deprecated
* Mark “legacy” Edge driver as deprecated -- we’ll remove it in the next major release.

## version-4.8.10 – 2022-06-01

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/index.html?path=102.0.5005.61/">102.0.5005.61</a>)

## version-4.8.9 – 2022-04-12

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/100.0.4896.60/notes.txt">100.0.4896.60</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.99.0.4844.51">99.0.4844.51</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.31.0">0.31.0</a>)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2022/04/stable-channel-update-for-desktop_11.html">100.0.4896</a>

## version-4.8.8 – 2022-03-20

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/99.0.4844.51/notes.txt">99.0.4844.51</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.98.0.4758.82">98.0.4758.82</a>)

## version-4.8.7 – 2022-02-16

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/98.0.4758.102/notes.txt">98.0.4758.102</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.97.0.4692.71">97.0.4692.71</a>)

## version-4.8.6 – 2022-01-18

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/97.0.4692.71/notes.txt">97.0.4692.71</a>)

## version-4.8.5 – 2021-11-27

### Info
* Requires at least KNIME 4.2 (please make sure you’re using an <a href="/download">update site URL</a> corresponding to your KNIME version)

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/96.0.4664.45/notes.txt">96.0.4664.45</a>)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2021/11/stable-channel-update-for-desktop.html">96.0.4664</a>

### Removed
* Remove driver binaries fragment for Windows 32 bit (KNIME 4.2 is 64 bit only)
* Remove bundled Chromium for Windows 32 bit (KNIME 4.2 is 64 bit only)

### Fixed
* <b>Extract Attribute</b>, <b>Clear</b>, <b>Click</b>, <b>Extract CSS Property</b>, <b>Drag and Drop</b>, <b>Extract Inner/OuterHTML</b>, <b>Send File Path</b>, <b>Send Keys</b>, <b>Submit</b>, <b>Table Extractor:</b> Fix “Extract First Match Only” toggle
* <b>Find Elements:</b> Dialog layout on resize

## version-4.8.4 – 2021-11-13

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/95.0.4638.69/notes.txt">95.0.4638.69</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.95.0.4638.54">95.0.4638.54</a>)

## version-4.8.3 – 2021-10-01

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/94.0.4606.61/notes.txt">94.0.4606.61</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.93.0.4577.63">93.0.4577.63</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.30.0">0.30.0</a>)

## version-4.8.2 – 2021-09-01

### Fixed
* <b>Start WebDriver</b> and <b>Get Pooled WebDriver:</b> Resolve concurrency issue (“Execute failed: webDriver must not be null”) when used within busy loops (see [here](https://forum.knime.com/t/execute-failed-webdriver-must-not-be-null/35545))

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/92.0.4515.107/notes.txt">92.0.4515.107</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.92.0.4515.107">92.0.4515.107</a>)

## version-4.8.1 – 2021-07-03

### Fixed
* KNIME 4.4 fixes (conflicts with XML-related classes on Java 11)

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/91.0.4472.101/notes.txt">91.0.4472.101</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.91.0.4472.77">91.0.4472.77</a>)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2021/06/stable-channel-update-for-desktop_24.html">91.0.4472</a>

### Deprecated
* Marked “HtmlUnit” as deprecated -- it’ll likely be removed from the next major release. As HtmlUnit is not state of the art for current websites, we strongly recommend to switch to headless Chrome or Firefox instead.

## version-4.8.0 – 2021-04-21

### Added
* <b>WebDriver Factory:</b> Add capability snippet to disable <code>navigator.webdriver</code> flag in Chrome (see [here](https://forum.knime.com/t/google-trends-using-selenium-web-scraping-getting-too-many-requests-error-or-captcha-message/31438))

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/90.0.4430.24/notes.txt">90.0.4430.24</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.89.0.4389.82">89.0.4389.82</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.29.1">0.29.1</a>)
* Updated bundled Chromium to <a href="https://chromereleases.googleblog.com/2021/04/stable-channel-update-for-desktop_20.html">90.0.4430.85</a>

## version-4.7.1 – 2021-02-16

### Fixed
* Fix plugin conflicts when running together with older Palladian versions (thanks to <a href="https://forum.knime.com/t/selenium-nodes-wont-install/30699">rfeigel</a>). Important: This requires that you also update your Palladian plugin to the most recent version. Apologies for any inconvenience!

## version-4.7 – 2021-02-16

### Info
* Requires at least KNIME 4.1 (please make sure you’re using an <a href="/download">update site URL</a> corresponding to your KNIME version)

### Added
* <b>Extract Attribute</b>, <b>Clear</b>, <b>Click</b>, <b>Extract CSS Property</b>, <b>Drag and Drop</b>, <b>Extract Inner/OuterHTML</b>, <b>Send File Path</b>, <b>Send Keys</b>, <b>Submit</b>, <b>Table Extractor:</b> New node versions which allow to pick WebElements directly within the dialog without having to put a “Find Elements” input node first (old versions still work and become “deprecated”)

### Changed
* <b>Extract Inner/OuterHTML</b> renamed to <b>Extract Text</b> and add “textContent” option
* Use NodePit Licensing plugin for license key management
* <b>Execute JavaScript:</b> Support boolean and long flow variables which finally made it to KNIME 4.1
* <b>Execute JavaScript:</b> Support collection flow variables and input cells
* <b>Execute JavaScript:</b> Support JSON input and output
* Add migration logic to replace deprecated nodes
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/88.0.4324.96/notes.txt">88.0.4324.96</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.88.0.4324.104">88.0.4324.104</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.29.0">0.29.0</a>)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2021/02/stable-channel-update-for-desktop_4.html">88.0.4324.153</a>

### Fixed
* <b>Execute JavaScript:</b> Properly map Boolean cells

## version-4.6.4 – 2020-12-25

### Fixed
* Prevent Chrome driver conflicts with KNIME’s JS nodes; do not use <code>webdriver.chrome.driver</code> system property (see [here](https://forum.knime.com/t/views-dont-show-up-when-using-selenium-nodes/29678))

## version-4.6.3 – 2020-12-19

### Fixed
* <b>Find Elements:</b> Fixed behavior in case of multiple subsequent element selects in browser (regression introduced in 4.6.2)
* <b>Find Elements:</b> Improve behavior when selecting <code>::before</code> and <code>::after</code> pseudo elements
* <b>Find Elements:</b> Fix outline view showing “Failed reading response message”

## version-4.6.2 – 2020-12-17

### Fixed
* <b>Find Elements:</b> Fixed the highlighting aka. “visual preview” of selected elements in Chromium-based browsers; unfortunately newer browser versions will disable the highlight when moving the mouse over the window -- we’re currently still investigating how this can be avoided

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/87.0.4280.88/notes.txt">87.0.4280.88</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.87.0.4280.67">87.0.4280.67</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.28.0">0.28.0</a>)

## version-4.6.1 – 2020-11-01
### Fixed
* <b>Find Elements:</b> Show hint in outline view when upstream nodes are not executed

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/86.0.4240.22/notes.txt">86.0.4240.22</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.86.0.4240.80">86.0.4240.80</a>, Internet Explorer Driver Server <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/trunk/cpp/iedriverserver/CHANGELOG">3.150.1</a>)

## version-4.6 – 2020-09-28
### Info
* Requires at least KNIME 4.0 (please make sure you’re using an <a href="/download">update site URL</a> corresponding to your KNIME version)

### Added
* <b>Table Extractor:</b> Allow to treat rowspan and colspan as missing cells
* <b>Select:</b> Add “Remove input column” setting
* <b>Send File:</b> New node for sending a file path e.g. to an <code>&lt;input&gt;</code> element
* <b>Extract Attribute:</b> Allow to specify name of output column
* <b>Extract CSS Property:</b> Allow to specify name of output column
* <b>Extract Outer/InnerHTML:</b> Allow to specify name of output column

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/85.0.4183.87/notes.txt">85.0.4183.87</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.85.0.4183.102">85.0.4183.102</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.27.0">0.27.0</a>)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2020/09/stable-channel-update-for-desktop_21.html">85.0.4183.121</a>
* <b>Extract InnerHTML:</b> Rename to <b>Extract Outer/InnerHTML</b>
* Improve error message when Selenium data is missing; explain to re-run from the “Start WebDriver” node
* <b>Extract Attribute:</b> Suggest common attribute names
* Hide driver binary settings in preferences

### Fixed
* <b>Select:</b> Saving of settings

## version-4.5 – 2020-08-02
### Fixed
* <b>Table Extractor:</b> Fixed handling of empty <code>&lt;tr&gt;&lt;/tr&gt;</code> rows (kudos <a href="https://twitter.com/armingrudd">@armingrudd</a>)

### Added
* <b>Table Extractor:</b> Allow to skip empty rows (kudos <a href="https://twitter.com/armingrudd">@armingrudd</a>)

### Changed
* Update driver binaries (OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.84.0.4147.89">84.0.4147.89</a>)

## version-4.4.3 – 2020-07-25
### Fixed
* Properly propagate proxy settings for Chrome (thanks to <a href="https://forum.knime.com/t/proxy-settings-of-webdriver-ignored/25108">dasturiol</a>)
* Typing for proxy port settings in Firefox template must be <code>Long</code> instead of <code>String</code> (thanks to <a href="https://forum.knime.com/t/proxy-settings-of-webdriver-ignored/25108">dasturiol</a>)

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/84.0.4147.30/notes.txt">84.0.4147.30</a>)

## version-4.4.2 – 2020-07-15
### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/83.0.4103.39/notes.txt">83.0.4103.39</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.83.0.4103.97">83.0.4103.97</a>)

## version-4.4.1 – 2020-05-20
### Fixed
* <b>Navigate:</b> Prevent validation errors when using Flow Variable input
* <b>Send Keys:</b> Prevent validation errors when using Flow Variable input

## version-4.4 – 2020-05-15

### Added
* <b>Navigate:</b> Add “Flow Variable” to URL input.
* <b>Send Keys:</b> Add “Flow Variable” to text input.
* <b>Wait:</b> Add “Flow Variable” to time input.
* <b>Find Elements:</b> Add “Flow Variable” to query and result column input.
* <b>Take Full Page Screenshot:</b> New node for taking “full page” screenhots (i.e. longer than the visible window bounds) using Chrome. Currently labeled as “beta” — your <a href="mailto:mail@seleniumnodes.com?subject=Take%20Full%20Page%20Screenshot">feedback</a> is welcome!

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/81.0.4044.138/notes.txt">81.0.4044.138</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.81.0.4044.113">81.0.4044.113</a>)

## version-4.3.2 – 2020-04-29

### Fixed
* <b>Start WebDriver:</b> Fix initialization of default factory.

## version-4.3.1 – 2020-04-18

### Fixed
* <b>Start WebDriver:</b> Fix type of optional input port.

## version-4.3.0 – 2020-04-17

### Added
* <b>Create PDF:</b> New node for creating PDF files using headless Chrome/Chromium browsers. Currently labeled as “beta” — your <a href="mailto:mail@seleniumnodes.com?subject=Create%20PDF%20Feedback">feedback</a> is welcome!
* <b>WebDriver Factory:</b> Add capability snippets for Firefox to disable image loading and for proxy servers (kudos <a href="https://twitter.com/armingrudd">@armingrudd</a>)
* <b>WebDriver Factory:</b> Add “Ignore Certificate Errors” for Firefox

### Changed
* Update driver binaries (ChromeDriver <a href="https://sites.google.com/a/chromium.org/chromedriver/">81.0.4044.69</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.80.0.3987.100">80.0.3987.100</a>)
* Update bundled Chromium to <a href="https://chromereleases.googleblog.com/2020/04/stable-channel-update-for-desktop_7.html">81.0.4044.92</a>
* <b>Start WebDriver:</b> Make input port for the factory optional, and allow to configure the WebDriver directly within the node configuration.

### Fixed
* <b>Reset on Load:</b> Fix when used in metanode or wrapped metanode or component or however these things are called now (thanks to <a href="https://forum.knime.com/t/reset-nodes/11507/12?u=qqilihq">Rich_ard</a>)

## version-4.2.0 – 2020-02-20

### Added
* WebDriver Factory: Add capability snippet for ignoring SSL certificate errors in Chrome

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/80.0.3987.106/notes.txt">80.0.3987.106</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.79.0.3945.79">79.0.3945.79</a>)
* Update bundled Chromium to 80.0.3987.117

## version-4.1.3 – 2019-12-28

### Fixed
* <b>Navigate:</b> Allow node configuration without input table

### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/79.0.3945.36/notes.txt">79.0.3945.36</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.78.0.3904.87">78.0.3904.87</a>)

## version-4.1.2 – 2019-12-17

### Fixed
* <b>Find Elements:</b> Fix outline and selection when using bundled Chromium (error message “Couldn’t connect to the browser.”)

## version-4.1.1 – 2019-11-08

### Fixed
* Fixed visual selection and preview for WebDrivers created with the “Get Pooled WebDriver” node.

## version-4.1 – 2019-11-05
### Info
* Requires at least KNIME 3.6 (please make sure you’re using an <a href="/download">update site URL</a> corresponding to your KNIME version)

### Added
* <b>Reset on Load:</b> New node to reset all connected downstream nodes everytime a workflow is loaded. This is useful together with the “Start WebDriver” node, which needs to be re-executed after loading a workflow. Currently labeled as “beta” — your <a href="mailto:mail@seleniumnodes.com?subject=Reset%20on%20Load%20Feedback">feedback</a> is welcome!
* <b>Find Elements:</b> New “visual selection” functionality for Chromium-based browsers; you can now select elements directly in the browser and the Find Elements dialog will create a matching selector for you.
* <b>Find Elements:</b> New “visual preview” functionality for Chromium-based browsers; the elements which match your selector will now be highlighted directly in the browser window.
* <b> Selenium Session Info:</b> New node which provides technical information (Selenium Server URL, Selenium Session ID) about a WebDriver

### Changed
* <b>Navigate:</b> Add “Current URL” button to insert the URL currently shown in the browser.
* Advocate and recommend “CSS” as the default selector method from now on (in “Find Elements” it’s the default settings now instead of XPath). Main reason: In contrast to XPath, CSS selectors do not require fiddly workarounds in case of namespaces, and it’s much easier to write <code>.class</code> and <code>#id</code> selectors. XPath will further be supported.
* Add node categorization
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/78.0.3904.70/notes.txt">78.0.3904.70</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.77.0.3865.120">77.0.3865.120</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.26.0">0.26.0</a>)
* Update bundled Chromium to 78.0.3904.87

### Deprecated
* The “Parse HTML source” DOM outline strategy is now deprecated, will no longer be maintained, and will be removed in the next major release — we recommend to use the new “Chrome DevTools”-based outline creator (see the preferences)

## version-4.0.2 – 2019-08-09
### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/76.0.3809.68/notes.txt">76.0.3809.68</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.75.0.3770.100">75.0.3770.100</a>)

## version-4.0.1 – 2019-06-28
### Fixed
* <b>Find Elements:</b> Properly return missing values if “Missing values” option is enabled together with “Wait”
* <b>WebDriver Factory:</b> Prevent exception when opening dialog with a missing factory

## version-4.0 – 2019-06-26
### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/75.0.3770.90/notes.txt">75.0.3770.90</a>)

### Removed
* Remove jBrowserDriver plugin, as jBrowserDriver cannot be used with KNIME 4.0 due to missing JavaFX components (see <a href="https://forum.knime.com/t/javafx-in-knime-4/15597">here</a> for the technical background). In case you’re updating and had jBrowserDriver installed before, you’ll see an error <b>“Cannot complete the install because of a conflicting dependency”</b>. In this case you manually need to <a href="https://forum.knime.com/t/announcement-selenium-nodes-4-0-released/15678/2">uninstall</a> jBrowserDriver first.
* Execute Selenium script: Remove <a href="changelog#version-3-0">deprecated</a> node
* Remove driver binaries fragment for Linux 32 bit (see <a href="changelog#version-3-1">here</a>)

### Info
* KNIME 4 compatibility

## version-3.2.1 – 2019-05-24
### Changed
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/74.0.3729.6/notes.txt">74.0.3729.6</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.2.45">2.45</a>)
* Update bundled Chromium to 74.0.3729.169

## version-3.2 – 2019-03-31
### Changed
* More efficient storage of WebDriver and WebElement cells
* Default renderer for WebDriver and WebElement cells now truncates to 1,000 characters to speed up table rendering. In case you prefer to see the entire cell snapshot, you can switch to “Search Context (full)” for “WebDriver” and “WebElement” in the “Preferred Renderers” preferences (or use the column header’s context menu to switch temporarily).
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/73.0.3683.68/notes.txt">73.0.3683.68</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.2.42">2.42</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.24.0">0.24.0</a>)
* <b>Take Screenshot:</b> Allow taking screenshots of WebElements (must be supported by browser)

## version-3.1.2 – 2019-03-03
### Fixed
* <b>Find Elements:</b> Further fix for XPath generation for fragments with ID

## version-3.1.1 – 2019-02-23
### Fixed
* <b>Execute JavaScript:</b> Handle missing values – kudos to <a href="https://forum.knime.com/t/execute-failed-org-knime-core-data-missingcell-cannot-be-cast-to-org-knime-core-data-stringvalue/13393/4?u=qqilihq">umutcankurt</a>
* Fix path to bundled Chromium on Windows environments

## version-3.1 – 2019-01-20
### Added
* <b>Find Elements:</b> Add option to return missing value in case nothing was found – kudos <a href="https://twitter.com/armingrudd">@armingrudd</a>

### Changed
* Update Selenium to <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/java/CHANGELOG">3.141.59</a>
* Update htmlunit-driver to <a href="https://github.com/SeleniumHQ/htmlunit-driver/releases/tag/2.33.3">2.33.3</a>
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/2.45/notes.txt">2.45</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.2.41">2.41</a>, Internet Explorer Driver Server <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/cpp/iedriverserver/CHANGELOG">3.14.0</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.23.0">0.23.0</a>)
* Update bundled Chromium to 71.0.3578.98
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v1.0.1">1.0.1</a>

### Deprecated
* With the next major release we will no longer provide driver binaries for Linux 32 bit (there are no more current ChromeDrivers for Linux 32 Bit)

### Fixed
* <b>Find Elements:</b> Allow to cancel node execution while waiting — kudos <a href="https://twitter.com/armingrudd">@armingrudd</a>
* <b>Find Elements:</b> Fix generated XPaths for page fragments with ID
* <b>Find Elements:</b> Fix string representation for empty comments in source view

## version-3.0.2 – 2018-12-06
### Fixed
* <b>Find Elements:</b> Fix for potentially hanging DOM preview. Many thanks to armingrudd for <a href="https://forum.knime.com/t/using-selenium-nodes-to-login-to-the-knime-forum/12808">reporting</a> this!

## version-3.0.1 – 2018-11-26
### Fixed
* <b>Alert:</b> Fix for saving the node configuration. In case you encounter any warnings or errors with this node during workflow load, configuration or execution, please open the Alert node’s configuration dialog once, confirm the settings, and re-save the workflow.

## version-3.0 – 2018-09-28
### Info
* Free update for all existing users
* Requires at least KNIME 3.4 (please make sure you’re using an <a href="/download">update site URL</a> corresponding to your KNIME version)

### Added
* <b>Current URL:</b> New node to get the currently shown URL of a WebDriver
* Add included <a href="https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/">Microsoft WebDriver 6.17134</a> for Edge
* Add “source snapshots” for WebDriver and WebElement cells
* Add a bundled <a href="https://www.chromium.org/">Chromium</a> browser available as a separate, optional installation

### Changed
* Update Selenium to <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/java/CHANGELOG">3.14.0</a>
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/2.41/notes.txt">2.41</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.2.37">3.37</a>, IE Driver Server <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/cpp/iedriverserver/CHANGELOG">3.13.0</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.21.0">0.21.0</a>)
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v1.0.0">1.0.0</a>
* <b>Find Elements:</b> Make node dialog “data aware” — in case an input table is present, the dialog now shows the actual DOM source and allows to create XPath queries by double clicking on a line. Furthermore, the number of matching elements for the current query is shown.
* <b>Navigate</b> and <b>Start WebDriver:</b> Allow usage of <code>knime:</code> URLs for local files
* <b>WebDriver Factory:</b> Show icons for different WebDrivers
* <b>Execute JavaScript:</b> Show icons for return types
* <b>Execute JavaScript:</b> Add note how to return complex data
* Move jBrowserDriver to a separate, optional installation
* Make “column guessing” logic more strict — in case an input column which was once configured is no longer available, the nodes will no show an error, instead of silently selecting a different column. In case you should encounter error messages with existing workflows, simply re-configure the corresponding nodes and explicitly select the appropriate input column once.
* <b>Get Pooled WebDriver:</b> Remove “BETA” label

### Deprecated
* <b>Execute Selenium script:</b> Mark node as deprecated, as the Selenium Builder project for creating JSON scripts is not maintained any longer. The node will be removed in the next major update.
* PhantomJS is now deprecated — the project is <a href="http://phantomjs.org">no longer maintained</a> and we strongly recommend to <a href="/faq#q22">switch</a> to headless Chrome or Firefox

### Fixed
* Fix capability support for jBrowserDriver

## version-2.0.2 – 2018-03-07
### Fixed
* Update ChromeDriver to <a href="https://chromedriver.storage.googleapis.com/2.36/notes.txt">2.36</a> (fixes executing JavaScript code on recent Chrome versions)

## version-2.0.1 – 2017-11-18
### Fixed
* Update ChromeDriver to <a href="https://chromedriver.storage.googleapis.com/2.33/notes.txt">2.33</a> to fix <a href="https://www.knime.com/forum/palladian-selenium/window-node">issue</a> when getting/setting window size/position on Chrome 64+

## version-2.0 – 2017-11-12
### Info
* Free update for all existing users
* <b>Important:</b> Update site URLs have changed — please see <a href="/download">here</a>
* Requires at least KNIME 3.2

### Added
* Public <a href="https://github.com/seleniumnodes/selenium-knime-dev">extension points</a> to add custom WebDriver and Locator implementations
* Support using the Selenium types <a href="https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/WebDriver.html">WebDriver</a> and <a href="https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/WebElement.html">WebElement</a> in KNIME’s Java Snippet node
* <b>Alert:</b> New node for interacting with JavaScript <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/alert">“Alert”</a>, <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm">“Confirm”</a>, and <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt">“Prompt”</a> boxes; <b>Important:</b> This does <b>not</b> work with the headless browsers (PhantomJS, jBrowser, and HtmlUnit, headless Chrome). Please read the node’s documentation on how to work with dialogs in a headless environment.
* <b>Get Pooled WebDriver:</b> New node which manages a global pool of WebDrivers respective browsers to drastically speed up certain scenarios. Still in incubation phase — any <a href="mailto:mail@seleniumnodes.com?subject=Pooled%20WebDriver%20Feedback">feedback</a> welcome!

### Changed
* <b>WebDriver Factory:</b> Greatly improved editor to allow access to the full Selenium capabilities power, add predefined capability snippets (e.g. for headless Chrome/Firefox, specifying proxy settings, ignoring SSL errors, etc.)
* <b>Find Elements:</b> New node implementation, old one becomes “deprecated”
* <b>Find Elements:</b> Added setting to manually specify result column name
* <b>Find Elements:</b> Added setting to specify polling interval in milliseconds when waiting for elements
* <b>Find Elements:</b> Cleaner layout of configuration dialog
* <b>Clear</b>, <b>Click</b>, <b>Extract Attribute</b>, <b>Extract CSS property</b>, <b>Extract InnerHTML</b>, <b>Send Keys</b>, <b>Submit:</b> Add setting “Remove input column”
* Update Selenium to <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/java/CHANGELOG">3.4.0</a>
* Update driver binaries (ChromeDriver <a href="https://chromedriver.storage.googleapis.com/2.30/notes.txt">2.30</a>, OperaChromiumDriver <a href="https://github.com/operasoftware/operachromiumdriver/releases/tag/v.2.29">2.29</a>, Internet Explorer Driver Server <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/cpp/iedriverserver/CHANGELOG">3.4.0</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/releases/tag/v0.18.0">0.18.0</a>)
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.17.8">0.17.8</a>
* <b>Table Extractor:</b> Remove “BETA” label and provide detailed node documentation
* <b>Table Extractor:</b> Improve column names in case the HTML table contains no header info
* <b>Table Extractor:</b> Further improve reliability in case of sloppily structured tables
* <b>Execute JavaScript:</b> Show meaningful error message when expected input columns or flow variables are missing
* <b>Navigate:</b> Cleaner layout of configuration dialog

### Deprecated
* <b>WebDriver Factory:</b> “Marionette” WebDriver is no longer necessary; use “Firefox” instead
* <b>WebDriver Factory:</b> “Opera (using Chrome driver)” is no longer necessary; use “Opera” instead

### Removed
* Removed old <a href="#beta-7">pooling</a> mechanism of PhantomJS instances which was intransparent to the user and suffered from the problem of leftover zombie instances when KNIME crashed

## version-1.2.2 – 2017-03-29
### Fixed
* <b>Table Extractor:</b> Gracefully handle case when table row contains less elements than expected; improve general error handling

## version-1.2.1 – 2017-03-12
### Info
* Final release for KNIME 2.12+

### Fixed
* <b>Find Elements:</b> Fix search context when specifying WebElements as input and using the “Explicit wait” option
* Additional synchronization, fix string representation of WebDriver and WebElement cells (see <a href="changelog#version-1-1-1">version-1.1.1</a>)
* Fix rare case of license parsing issue causing an unjustified “The license is invalid.” message

## version-1.2 – 2017-02-05
### Added
* <b>Table Extractor:</b> A new node for the convenient conversion of an HTML <code>&lt;table&gt;</code> into a KNIME table. Currently in early beta — your <a href="mailto:mail@seleniumnodes.com?subject=Table%20Extractor%20Feedback">feedback</a> is welcome!

### Changed
* Update ChromeDriver to <a href="https://chromedriver.storage.googleapis.com/2.27/notes.txt">2.27</a>
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.17.3">0.17.3</a>

### Fixed
* <b>Frame:</b> Fixed selection menu for WebElement input

## version-1.1.1 – 2017-02-02
### Fixed
* Fixing nasty synchronization issue which sometimes caused an “Execute failed: Error communicating with the remote browser. It may have died.” error when running strongly parallelized branches. Many thanks to Julian Leweling for the valuable input towards localizing this problem!
* Set correct version numbers for plugins and features.

## version-1.1 – 2017-01-22
### Changed
* <b>Frame:</b> Updated with additional methods to select frames, and to navigate back to the parent frame. Old version of the node is marked as “deprecated”.

### Fixed
* <b>Execute JavaScript:</b> Fix loading of flow variable inputs.

## version-1.0 – 2017-01-02
### Info
* Ended beta phase

### Fixed
* Adding a <a href="https://tech.knime.org/forum/palladian-selenium/selenium-nodes-adblock-plugin#comment-46770">fixed</a> Opera driver

## beta-10.3 – 2016-11-05
### Fixed
* Fix running Marionette on Windows for good. Apologies and thank you for your patience!
* <b>Quit WebDriver:</b> Avoid errors when quitting a WebDriver which is not available any longer; instead only show a warning.

## beta-10.2 – 2016-10-25
### Fixed
* Fix for running Marionette on Windows caused by <a href="https://tech.knime.org/forum/palladian-selenium/webdriver-not-working-with-chrome#comment-46115">invalid bundle path</a>

## beta-10.1 – 2016-10-23
### Added
* <b>Drag and Drop:</b> New node to drag WebElements

## beta-10 – 2016-10-22
### Changed
* <b>Send Keys:</b> Add additional node documentation on how to send special keys
* Update HtmlUnitDriver to 2.22

### Fixed
* Update ChromeDriver to <a href="http://chromedriver.storage.googleapis.com/2.24/notes.txt">2.24</a> to fix <a href="https://tech.knime.org/forum/palladian-selenium/webdriver-not-working-with-chrome#comment-46000">“SessionNotCreatedException”</a> on Chrome 54+
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.17.0">0.17.0</a> and fix launching issue when KNIME directory is located on a path with spaces

### Deprecated
* Old Firefox driver is now deprecated. Instead, <a href="https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette">Marionette</a> should be used for working with Firefox.

## beta-9 – 2016-08-30
### Changed
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.15.0">0.15.0</a>

### Fixed
* <b>Quit WebDriver:</b> Eliminate potential exception

## beta-8.4 – 2016-07-08
### Changed
* Update Selenium to <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/java/CHANGELOG">2.53.1</a>
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.14.9">0.14.9</a>
* Update driver binaries (ChromeDriver <a href="http://chromedriver.storage.googleapis.com/2.22/notes.txt">2.22</a>, geckodriver <a href="https://github.com/mozilla/geckodriver/blob/master/CHANGES.md">0.9.0</a>, Internet Explorer Driver Server <a href="https://raw.githubusercontent.com/SeleniumHQ/selenium/master/cpp/iedriverserver/CHANGELOG">2.53.1</a>)

## beta-8.3 – 2016-06-09
### Fixed
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.14.5">0.14.5</a> which gets rid of a custom SecurityManager and thus resolves issues in KNIME in conjunction with parallel streams

## beta-8.2 – 2016-05-25
### Fixed
* Fix starting of included PhantomJS executable when path to binary file contains spaces
* Make changes to PhantomJS executable path reflect on all newly created instances

## beta-8.1 – 2016-05-25
### Changed
* Do not show any notification prompts in Chrome during execution

### Fixed
* <b>Quit WebDriver:</b> Fix error when table contains multiple instances of one WebDriver

## beta-8 – 2016-05-20
### Changed
* Update jBrowserDriver to <a href="https://github.com/MachinePublishers/jBrowserDriver/releases/tag/v0.13.4">0.13.4</a>
* Replace old PhantomJS driver with <a href="changelog#beta-7">pooled version</a>, configuration option to specify number of pooled instances

### Fixed
* Passing Selenium data between nodes now works correctly when “Write tables to disc.” is enabled
* Add <a href="changelog#beta-7">forgotten</a> PhantomJS binary for Linux
* Fix serialization regression on KNIME 2.12 introduced with <a href="changelog#beta-7">beta-7</a>

## beta-7 – 2016-04-17
### Added
* Added <a href="https://github.com/MachinePublishers/jBrowserDriver">jBrowserDriver</a> (only in version for KNIME 3.1+)
* Pooling of PhantomJS processes

### Changed
* Shortening exception messages when displayed in tool tips
* Update bundled driver binaries (Chrome 2.21, Internet Explorer 2.53.0, PhantomJS 2.1.1, Marionette 0.6.2); bundled PhantomJS now also available for Linux

### Fixed
* Update Selenium to version <a href="https://github.com/SeleniumHQ/selenium/blob/master/java/CHANGELOG">2.53.0</a> (fixes <a href="https://tech.knime.org/forum/palladian-selenium/start-webdriver-error">issue</a> with recent Firefox 45)

## beta-6 – 2016-02-29
### Added
* Added <a href="https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette">Marionette</a> and <a href="https://msdn.microsoft.com/en-us/library/mt188085(v=vs.85).aspx">Edge</a> drivers
* <b>Frame:</b> New node for frame switching

### Changed
* <b>Start WebDriver:</b> Quit WebDrivers when resetting the node (before, they were only quit when KNIME was closed)
* <b>WebDriver Factory:</b> Show capabilities on port mouse over
* <b>Wait:</b> Added optional input port
* <b>Wait:</b> Improve progress reporting
* <b>Execute JavaScript:</b> Ability to select flow variables as input

### Fixed
* Update Selenium to version <a href="https://github.com/SeleniumHQ/selenium/blob/master/dotnet/CHANGELOG">2.48.2</a> (fixes issue with recent Firefox 43)

## beta-5 – 2015-12-04
### Info
* KNIME 3 compatibility

### Added
* <b>Select:</b> New node for selecting items in <code>&lt;select&gt;</code> menus
* Bundle (almost) all driver binaries with the node distribution; this means no more additional manual downloads.

## beta-4 – 2015-11-01
### Changed
* <b>Find Elements:</b> Option to avoid failing node in case no element is found
* <b>Send Keys:</b> Ability to send special characters

## beta-3 – 2015-09-30
### Added
* <b>Execute Selenium script:</b> New node
* <b>WebDriver Factory:</b> New node; support RemoteWebDrivers; ability to specify Selenium capabilities
* <b>Window:</b> New node
* <b>Bulk RemoteWebDriver Factory:</b> New node

### Changed
* <b>Find Elements:</b> Meaningful column names for appended columns
* <b>Find Elements:</b> “Extract only first match” option
* <b>Start WebDriver:</b> Do not require a URL
* <b>Find Elements:</b> Improved progress monitoring
* <b>Quit WebDriver:</b> Provide output table
* <b>Execute JavaScript:</b> Ability to execute asynchronous JavaScripts
* <b>Start WebDriver:</b> Ability to specify global timeouts
* <b>Execute JavaScript:</b> Improved dialog layout, added syntax highlighting
* <b>Start WebDriver:</b> Ability to specify implicit wait
* <b>Find Elements:</b> Ability to specify explicit wait

### Fixed
* <b>InnerHTML:</b> Fixed node description and select default options

## beta-2 – 2015-08-30
### Added
* <b>Extract InnerHTML:</b> New node

### Changed
* Close open WebDrivers when quitting KNIME
* Append unique column names to avoid any conflicts

## beta-1 – 2015-08-04
### Info
* Initial release
