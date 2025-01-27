import CardSpacer from "@saleor/components/CardSpacer";
import CompanyAddressInput from "@saleor/components/CompanyAddressInput";
import Container from "@saleor/components/Container";
import Form from "@saleor/components/Form";
import Grid from "@saleor/components/Grid";
import PageHeader from "@saleor/components/PageHeader";
import Savebar from "@saleor/components/Savebar";
import { AddressTypeInput } from "@saleor/customers/types";
import {
  CountryCode,
  CountryWithCodeFragment,
  WarehouseClickAndCollectOptionEnum,
  WarehouseDetailsFragment,
  WarehouseErrorFragment
} from "@saleor/graphql";
import useAddressValidation from "@saleor/hooks/useAddressValidation";
import { SubmitPromise } from "@saleor/hooks/useForm";
import useStateFromProps from "@saleor/hooks/useStateFromProps";
import { sectionNames } from "@saleor/intl";
import { Backlink, ConfirmButtonTransitionState } from "@saleor/macaw-ui";
import { findValueInEnum, maybe } from "@saleor/misc";
import createSingleAutocompleteSelectHandler from "@saleor/utils/handlers/singleAutocompleteSelectChangeHandler";
import { mapCountriesToChoices, mapEdgesToItems } from "@saleor/utils/maps";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import WarehouseInfo from "../WarehouseInfo";
import WarehouseSettings from "../WarehouseSettings";

export interface WarehouseDetailsPageFormData extends AddressTypeInput {
  name: string;
  isPrivate: boolean;
  clickAndCollectOption: WarehouseClickAndCollectOptionEnum;
}
export interface WarehouseDetailsPageProps {
  countries: CountryWithCodeFragment[];
  disabled: boolean;
  errors: WarehouseErrorFragment[];
  saveButtonBarState: ConfirmButtonTransitionState;
  warehouse: WarehouseDetailsFragment;
  onBack: () => void;
  onDelete: () => void;
  onShippingZoneClick: (id: string) => void;
  onSubmit: (data: WarehouseDetailsPageFormData) => SubmitPromise;
}

const WarehouseDetailsPage: React.FC<WarehouseDetailsPageProps> = ({
  countries,
  disabled,
  errors,
  saveButtonBarState,
  warehouse,
  onBack,
  onDelete,
  onShippingZoneClick,
  onSubmit
}) => {
  const intl = useIntl();
  const [displayCountry, setDisplayCountry] = useStateFromProps(
    warehouse?.address?.country.country || ""
  );

  const {
    errors: validationErrors,
    submit: handleSubmit
  } = useAddressValidation(onSubmit);

  const initialForm: WarehouseDetailsPageFormData = {
    city: maybe(() => warehouse.address.city, ""),
    companyName: maybe(() => warehouse.address.companyName, ""),
    country: maybe(() =>
      findValueInEnum(warehouse.address.country.code, CountryCode)
    ),
    isPrivate: !!warehouse?.isPrivate,
    clickAndCollectOption:
      warehouse?.clickAndCollectOption ||
      WarehouseClickAndCollectOptionEnum.DISABLED,
    countryArea: maybe(() => warehouse.address.countryArea, ""),
    name: maybe(() => warehouse.name, ""),
    phone: maybe(() => warehouse.address.phone, ""),
    postalCode: maybe(() => warehouse.address.postalCode, ""),
    streetAddress1: maybe(() => warehouse.address.streetAddress1, ""),
    streetAddress2: maybe(() => warehouse.address.streetAddress2, "")
  };

  return (
    <Form confirmLeave initial={initialForm} onSubmit={handleSubmit}>
      {({ change, data, hasChanged, submit, set }) => {
        const countryChoices = mapCountriesToChoices(countries);
        const handleCountryChange = createSingleAutocompleteSelectHandler(
          change,
          setDisplayCountry,
          countryChoices
        );

        return (
          <Container>
            <Backlink onClick={onBack}>
              <FormattedMessage {...sectionNames.warehouses} />
            </Backlink>
            <PageHeader title={warehouse?.name} />
            <Grid>
              <div>
                <WarehouseInfo
                  data={data}
                  disabled={disabled}
                  errors={errors}
                  onChange={change}
                />
                <CardSpacer />
                <CompanyAddressInput
                  countries={countryChoices}
                  data={data}
                  disabled={disabled}
                  displayCountry={displayCountry}
                  errors={[...errors, ...validationErrors]}
                  header={intl.formatMessage({
                    defaultMessage: "Address Information",
                    description: "warehouse"
                  })}
                  onChange={change}
                  onCountryChange={handleCountryChange}
                />
              </div>
              <div>
                <WarehouseSettings
                  zones={mapEdgesToItems(warehouse?.shippingZones)}
                  data={data}
                  disabled={disabled}
                  onShippingZoneClick={onShippingZoneClick}
                  onChange={change}
                  setData={set}
                />
              </div>
            </Grid>
            <Savebar
              disabled={disabled || !hasChanged}
              onCancel={onBack}
              onDelete={onDelete}
              onSubmit={submit}
              state={saveButtonBarState}
            />
          </Container>
        );
      }}
    </Form>
  );
};

WarehouseDetailsPage.displayName = "WarehouseDetailsPage";
export default WarehouseDetailsPage;
