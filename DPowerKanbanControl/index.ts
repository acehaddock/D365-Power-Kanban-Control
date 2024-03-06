import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as WebApiClient from "xrm-webapi-client";
import { App, AppProps } from "./components/App";

import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class DPowerKanbanControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;

	private config: any = null;

    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public async init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
        this._notifyOutputChanged = notifyOutputChanged;
		this._context = context;
		this._container = container;
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void>
    {
        // Add code to update control view
        if (this._context.parameters.primaryDataSet.loading) {
			return;
		}

		// Only render once all primary IDs are settled
		if ((this._context.parameters.primaryDataSet.paging as any).pageSize !== 5000) {
			this._context.parameters.primaryDataSet.paging.setPageSize(5000);
			this._context.parameters.primaryDataSet.refresh();
			
			return;
		}

		if (!this.config) {
			const configName = this._context.parameters.configName.raw;
			this.config = !configName ? null : await WebApiClient.Retrieve({ entityName: "oss_powerkanbanconfig", alternateKey:  [ { property: "oss_uniquename", value: configName } ], queryParams: "?$select=oss_powerkanbanconfigid" });
		}

		const props: AppProps = {
			appId: (this._context as any).page?.appId,
			primaryEntityLogicalName: this._context.parameters.primaryDataSet.getTargetEntityType(),
			configId: this.config ? this.config.oss_powerkanbanconfigid : null,
			primaryEntityId: (context.mode as any).contextInfo.entityId,
			primaryDataIds: this._context.parameters.primaryDataSet.sortedRecordIds,
			pcfContext: this._context
		};

		ReactDOM.render(
			React.createElement(App, props),
			this._container
		);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
        ReactDOM.unmountComponentAtNode(this._container);
    }
}
