import {
  APIApplicationCommandInteractionDataAttachmentOption,
  APIApplicationCommandInteractionDataBooleanOption,
  APIApplicationCommandInteractionDataChannelOption,
  APIApplicationCommandInteractionDataIntegerOption,
  APIApplicationCommandInteractionDataMentionableOption,
  APIApplicationCommandInteractionDataNumberOption,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataRoleOption,
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandInteractionDataSubcommandGroupOption,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIApplicationCommandInteractionDataUserOption,
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { Immutable, Prettify } from "./utils.js";

// Gets option's value
type OptValue<T extends Immutable<APIApplicationCommandOption>> =
  OptToInteraction<T["type"]> & { name: T["name"] };

type OptToInteraction<T extends ApplicationCommandOptionType> =
  T extends ApplicationCommandOptionType.Subcommand
    ? APIApplicationCommandInteractionDataSubcommandOption
    : T extends ApplicationCommandOptionType.SubcommandGroup
    ? APIApplicationCommandInteractionDataSubcommandGroupOption
    : T extends ApplicationCommandOptionType.String
    ? APIApplicationCommandInteractionDataStringOption
    : T extends ApplicationCommandOptionType.Integer
    ? APIApplicationCommandInteractionDataIntegerOption
    : T extends ApplicationCommandOptionType.Boolean
    ? APIApplicationCommandInteractionDataBooleanOption
    : T extends ApplicationCommandOptionType.User
    ? APIApplicationCommandInteractionDataUserOption
    : T extends ApplicationCommandOptionType.Channel
    ? APIApplicationCommandInteractionDataChannelOption
    : T extends ApplicationCommandOptionType.Role
    ? APIApplicationCommandInteractionDataRoleOption
    : T extends ApplicationCommandOptionType.Mentionable
    ? APIApplicationCommandInteractionDataMentionableOption
    : T extends ApplicationCommandOptionType.Number
    ? APIApplicationCommandInteractionDataNumberOption
    : T extends ApplicationCommandOptionType.Attachment
    ? APIApplicationCommandInteractionDataAttachmentOption
    : never;

type Opt1<T extends Immutable<APIApplicationCommandOption[]>> = {
  [P in T[number] as P["name"]]: OptValue<P>;
};

type Opt2<T extends Immutable<APIApplicationCommandOption[]>> = {
  [P in T[number] as P["name"]]: P extends {
    options: Immutable<APIApplicationCommandOption[]>;
  }
    ? Opt1<P["options"]>
    : OptValue<P>;
};

type Opt3<T extends Immutable<APIApplicationCommandOption[]>> = {
  [P in T[number] as P["name"]]: P extends {
    options: Immutable<APIApplicationCommandOption[]>;
  }
    ? Opt2<P["options"]>
    : OptValue<P>;
};

export class Options<T extends Immutable<APIApplicationCommandOption[]>> {
  constructor(private value: APIApplicationCommandInteractionDataOption[]) {}

  pluck<K extends Opt1<T>, Option1 extends keyof K>(
    option1: Option1
  ): Prettify<K[Option1]> | undefined;
  pluck<
    K extends Opt2<T>,
    Option1 extends keyof K,
    Option2 extends keyof K[Option1]
  >(
    option1: Option1,
    option2: Option2
  ): Prettify<K[Option1][Option2]> | undefined;
  pluck<
    K extends Opt3<T>,
    Option1 extends keyof K,
    Option2 extends keyof K[Option1],
    Option3 extends keyof K[Option1][Option2]
  >(
    option1: Option1,
    option2: Option2,
    option3: Option3
  ): Prettify<K[Option1][Option2][Option3]> | undefined;
  pluck(option1: string, option2?: string, option3?: string): any {
    // option 1
    const ret1 = this.value.find((opt) => opt.name === option1);
    if (!option2) return ret1;

    // option 2
    if (!(ret1 && "options" in ret1)) return undefined;
    const ret2 = (
      ret1.options as APIApplicationCommandInteractionDataOption[]
    ).find((opt) => opt.name === option2);
    if (!option3) return ret2;

    // option 3
    if (!(ret2 && "options" in ret2)) return undefined;
    return (ret2.options as APIApplicationCommandInteractionDataOption[]).find(
      (opt) => opt.name === option3
    );
  }
}
